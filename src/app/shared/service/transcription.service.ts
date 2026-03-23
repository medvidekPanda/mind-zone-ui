import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { AuthService } from "./auth.service";

export interface TranscriptionStatus {
  status: string;
  progress: number;
  error?: string | null;
  result?: unknown;
}

export interface TranscriptionProgressEvent {
  status: string;
  progress: number;
  error?: string | null;
}

@Injectable({
  providedIn: "root",
})
export class TranscriptionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  getTranscription(sessionId: string, attachmentId: string): Observable<TranscriptionStatus> {
    return this.http.get<TranscriptionStatus>(
      `${this.apiUrl}/sessions/${sessionId}/attachments/${attachmentId}/transcription`,
    );
  }

  triggerTranscription(
    sessionId: string,
    attachmentId: string,
    options?: { language?: string; minSpeakers?: number; maxSpeakers?: number },
  ): Observable<void> {
    const params: Record<string, string> = { language: options?.language ?? "cs" };
    if (options?.minSpeakers != null) params["min_speakers"] = String(options.minSpeakers);
    if (options?.maxSpeakers != null) params["max_speakers"] = String(options.maxSpeakers);

    return this.http.post<void>(
      `${this.apiUrl}/sessions/${sessionId}/attachments/${attachmentId}/transcribe`,
      null,
      { params },
    );
  }

  streamProgress(sessionId: string, attachmentId: string): Observable<TranscriptionProgressEvent> {
    return new Observable((subscriber) => {
      const abortController = new AbortController();

      const startStream = async () => {
        const token = await this.authService.getIdToken();
        const url = `${this.apiUrl}/sessions/${sessionId}/attachments/${attachmentId}/transcription/progress`;

        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: abortController.signal,
        });

        if (!response.ok) {
          subscriber.error(new Error(`SSE request failed: ${response.status}`));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          subscriber.error(new Error("No readable stream"));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr) as TranscriptionProgressEvent;
              subscriber.next(data);

              if (data.status === "completed" || data.status === "failed") {
                subscriber.complete();
                return;
              }
            } catch {
              // Skip malformed SSE data
            }
          }
        }

        subscriber.complete();
      };

      startStream().catch((err) => {
        if (err.name !== "AbortError") {
          subscriber.error(err);
        }
      });

      return () => abortController.abort();
    });
  }
}
