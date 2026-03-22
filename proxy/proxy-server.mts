import { ChildProcess, spawn } from "child_process";
import compression from "compression";
import express, { NextFunction, Request, Response } from "express";
import { Server } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const INSTANCES = +(process.env.INSTANCES ?? 2);
const PROXY_PORT = +(process.env.PORT ?? 80);
const BASE_ANGULAR_PORT = 4201;
const ANGULAR_PORTS = Array.from({ length: INSTANCES }, (_, i) => BASE_ANGULAR_PORT + i);

const DIST_PATH = path.join(__dirname, "..", "dist", "mind-zone-ui");
const BROWSER_PATH = path.join(DIST_PATH, "browser");
const SERVER_PATH = path.join(DIST_PATH, "server");

const API_URL = process.env.API_URL || "http://localhost:3001";

const PROXY_TIMEOUT_MS = 45_000;
const SERVER_START_TIMEOUT_MS = 15_000;
const RESTART_DELAY_MS = 5_000;
const HASHED_FILE_RE = /\.[a-f0-9]{8,}\.(js|css)$/i;

// ---------------------------------------------------------------------------
// Round-robin load balancer (skips unhealthy instances)
// ---------------------------------------------------------------------------

let currentIndex = 0;
const healthyPorts = new Set<number>(ANGULAR_PORTS);

const getNextPort = (): number => {
  const healthy = ANGULAR_PORTS.filter((p) => healthyPorts.has(p));
  if (healthy.length === 0) {
    // Fallback to all ports if none are marked healthy
    const port = ANGULAR_PORTS[currentIndex % ANGULAR_PORTS.length];
    currentIndex = (currentIndex + 1) % ANGULAR_PORTS.length;
    return port;
  }
  const port = healthy[currentIndex % healthy.length];
  currentIndex = (currentIndex + 1) % healthy.length;
  return port;
};

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
app.set("trust proxy", 1);
app.use(compression());

app.get("/_health", (_req, res) => {
  res.json({
    status: "ok",
    instances: INSTANCES,
    ports: ANGULAR_PORTS,
    apiUrl: API_URL,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// API proxy — redirects /api to backend
// ---------------------------------------------------------------------------

app.use(
  "/api",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    pathFilter: "/api",
    timeout: PROXY_TIMEOUT_MS,
    proxyTimeout: PROXY_TIMEOUT_MS,
    on: {
      error(err, _req, res) {
        console.error(`[proxy] API upstream error: ${(err as Error).message}`);
        if (res && "headersSent" in res && !(res as Response).headersSent) {
          (res as Response).status(502).json({ error: "API Gateway Error" });
        }
      },
    },
  }),
);

// ---------------------------------------------------------------------------
// Static files — same caching strategy as locus proxy
// ---------------------------------------------------------------------------

app.use(
  express.static(BROWSER_PATH, {
    dotfiles: "allow",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const filename = path.basename(filePath);

      if ((ext === ".js" || ext === ".css") && HASHED_FILE_RE.test(filename)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if ([".woff", ".woff2", ".ttf", ".eot"].includes(ext)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if ([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".ico"].includes(ext)) {
        res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      } else if (ext === ".json") {
        res.setHeader("Cache-Control", "public, max-age=86400, must-revalidate");
      } else {
        res.setHeader("Cache-Control", "public, max-age=2592000, must-revalidate");
      }
    },
  }),
);

// ---------------------------------------------------------------------------
// Proxy
// ---------------------------------------------------------------------------

let isShuttingDown = false;

const proxyMiddleware = createProxyMiddleware({
  target: `http://localhost:${ANGULAR_PORTS[0]}`,
  router: () => `http://localhost:${getNextPort()}`,
  timeout: PROXY_TIMEOUT_MS,
  on: {
    error(err, _req, res) {
      console.error(`[proxy] error: ${(err as Error).message}`);
      if (res && "writeHead" in res && typeof (res as Response).writeHead === "function") {
        (res as Response).writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad Gateway");
      }
    },
  },
});

app.use("/", (req: Request, res: Response, next: NextFunction) => {
  if (isShuttingDown) {
    res.status(503).send("Service Unavailable");
    return;
  }
  proxyMiddleware(req, res, next);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (!res.headersSent) res.status(502).send("Bad Gateway");
});

// ---------------------------------------------------------------------------
// Angular process management
// ---------------------------------------------------------------------------

const processes: (ChildProcess | null)[] = Array(INSTANCES).fill(null);

const spawnAngular = (index: number): void => {
  const port = ANGULAR_PORTS[index];

  const child = spawn("node", [path.join(SERVER_PATH, "server.mjs")], {
    env: { ...process.env, PORT: String(port) },
    stdio: "inherit",
  });

  processes[index] = child;

  child.on("error", (err) => {
    console.error(`[angular:${port}] spawn error: ${err.message}`);
    healthyPorts.delete(port);
  });

  child.on("exit", (code) => {
    healthyPorts.delete(port);
    if (!isShuttingDown && code !== 0) {
      console.error(`[angular:${port}] exited with code ${code}, restarting in ${RESTART_DELAY_MS}ms...`);
      setTimeout(() => spawnAngular(index), RESTART_DELAY_MS);
    }
  });
};

const waitForServer = (port: number): Promise<void> =>
  new Promise((resolve, reject) => {
    const deadline = Date.now() + SERVER_START_TIMEOUT_MS;

    const check = async (): Promise<void> => {
      try {
        const res = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(1_000) });
        if (res.status < 500) return resolve();
      } catch {}

      if (Date.now() >= deadline) {
        return reject(new Error(`Angular server on port ${port} did not start within ${SERVER_START_TIMEOUT_MS}ms`));
      }

      setTimeout(check, 500);
    };

    setTimeout(check, 1_000);
  });

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

console.log(`[proxy] Starting ${INSTANCES} Angular SSR instance(s) on ports: ${ANGULAR_PORTS.join(", ")}`);
ANGULAR_PORTS.forEach((_, i) => spawnAngular(i));

try {
  await Promise.all(
    ANGULAR_PORTS.map(async (port) => {
      await waitForServer(port);
      healthyPorts.add(port);
    }),
  );
} catch (err) {
  console.error(`[proxy] Startup failed: ${(err as Error).message}`);
  process.exit(1);
}

const server: Server = app.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`[proxy] Listening on port ${PROXY_PORT} → Angular instances: ${ANGULAR_PORTS.join(", ")}`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

const shutdown = (): void => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("[proxy] Shutdown signal received, shutting down gracefully...");

  server.close(() => {
    console.log("[proxy] HTTP server closed");
  });

  for (const child of processes) {
    child?.kill("SIGTERM");
  }

  setTimeout(() => process.exit(0), 5_000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
