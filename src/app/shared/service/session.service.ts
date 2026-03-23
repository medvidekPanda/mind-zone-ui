import { HttpClient, HttpEvent } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Session, SessionAttachment, SessionPayload } from "../interfaces/session.interface";

export interface AttachmentUploadOptions {
  transcribe: boolean;
  minSpeakers: number;
  maxSpeakers: number;
}

@Injectable({
  providedIn: "root",
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getSessions(params?: { from?: string; to?: string; userId?: string }): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/sessions`, { params });
  }

  getSession(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/sessions/${id}`);
  }

  createSession(session: SessionPayload): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/sessions`, session);
  }

  updateSession(id: string, session: Partial<SessionPayload>): Observable<Session> {
    return this.http.patch<Session>(`${this.apiUrl}/sessions/${id}`, session);
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sessions/${id}`);
  }

  uploadAttachment(sessionId: string, file: File, options?: AttachmentUploadOptions): Observable<SessionAttachment> {
    return this.http.post<SessionAttachment>(
      `${this.apiUrl}/sessions/${sessionId}/attachments`,
      this.buildUploadFormData(file, options),
    );
  }

  uploadAttachmentWithProgress(
    sessionId: string,
    file: File,
    options?: AttachmentUploadOptions,
  ): Observable<HttpEvent<SessionAttachment>> {
    return this.http.post<SessionAttachment>(
      `${this.apiUrl}/sessions/${sessionId}/attachments`,
      this.buildUploadFormData(file, options),
      { reportProgress: true, observe: "events" },
    );
  }

  private buildUploadFormData(file: File, options?: AttachmentUploadOptions): FormData {
    const formData = new FormData();
    formData.append("file", file);
    if (options) {
      formData.append("transcribe", String(options.transcribe));
      formData.append("min_speakers", String(options.minSpeakers));
      formData.append("max_speakers", String(options.maxSpeakers));
    }
    return formData;
  }

  downloadAttachment(sessionId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sessions/${sessionId}/attachments/${attachmentId}/download`, {
      responseType: "blob",
    });
  }

  deleteAttachment(sessionId: string, attachmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sessions/${sessionId}/attachments/${attachmentId}`);
  }
}
