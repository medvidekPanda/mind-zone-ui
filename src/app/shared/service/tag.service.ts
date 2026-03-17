import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Tag, TagPayload } from "../interfaces/tag.interface";

@Injectable({
  providedIn: "root",
})
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }

  createTag(payload: TagPayload): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/tags`, payload);
  }

  deleteTag(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tags/${id}`);
  }
}
