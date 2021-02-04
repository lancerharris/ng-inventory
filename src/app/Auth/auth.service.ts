import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isSigningUp: boolean = false;
  authModeChanged = new Subject<boolean>();
  constructor() { }

  setIsSigningUpTo(signingUp) {
    this.isSigningUp = signingUp;
    this.authModeChanged.next(this.isSigningUp);
  }
}
