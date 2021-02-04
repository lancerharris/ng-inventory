import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isSigningUp: boolean;
  constructor() { }
}
