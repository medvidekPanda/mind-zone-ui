import { HttpClient, HttpEvent } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Session, SessionAttachment, SessionPayload } from "../interfaces/session.interface";

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

  uploadAttachment(sessionId: string, file: File): Observable<SessionAttachment> {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post<SessionAttachment>(`${this.apiUrl}/sessions/${sessionId}/attachments`, formData);
  }

  uploadAttachmentWithProgress(sessionId: string, file: File): Observable<HttpEvent<SessionAttachment>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http.post<SessionAttachment>(`${this.apiUrl}/sessions/${sessionId}/attachments`, formData, {
      reportProgress: true,
      observe: "events",
    });
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
