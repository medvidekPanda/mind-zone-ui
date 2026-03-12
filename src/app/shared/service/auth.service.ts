import { Injectable, inject } from "@angular/core";
import { Auth, authState, getIdToken, signInWithEmailAndPassword, signOut } from "@angular/fire/auth";

import { User as FirebaseUser } from "firebase/auth";
import { Observable, from } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly auth = inject(Auth);

  readonly currentUser$: Observable<FirebaseUser | null> = authState(this.auth);

  login(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(this.auth, email, password).then(() => undefined));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return Promise.resolve(null);

    return getIdToken(user);
  }
}
