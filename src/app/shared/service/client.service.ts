import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Client, ClientPayload } from "../interfaces/client.interface";

@Injectable({
  providedIn: "root",
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  getClient(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  createClient(client: ClientPayload): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients`, client);
  }

  updateClient(id: string, client: ClientPayload): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/clients/${id}`, client);
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
  }
}
