import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter, withComponentInputBinding } from "@angular/router";

import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import { providePrimeNG } from "primeng/config";

import { environment } from "../environments/environment";
import { routes } from "./app.routes";
import { authInterceptor } from "./shared/service/auth.interceptor";

const appPreset = definePreset(Aura, {
  components: {
    avatar: {
      xl: {
        width: "8rem",
        height: "8rem",
        fontSize: "2.25rem",
        icon: { size: "2.25rem" },
        group: { offset: "-0.5rem" },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: appPreset,
        options: {
          prefix: "p",
          darkModeSelector: "light",
          cssLayer: false,
        },
      },
    }),
  ],
};
