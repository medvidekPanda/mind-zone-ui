import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";

import { MessageService } from "primeng/api";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((httpError) => {
      const detail = httpError?.error?.message ?? httpError?.message ?? "Neznámá chyba";
      messageService.add({ severity: "error", summary: "Error", detail });
      return throwError(() => httpError);
    }),
  );
};
