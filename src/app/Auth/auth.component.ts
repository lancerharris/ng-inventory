import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: [],
})
export class AuthComponent implements OnInit, OnDestroy {
  isSigningUp: boolean;
  authSub: Subscription;
  error: string = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authSub = this.authService.authModeChanged.subscribe((signingUp) => {
      this.isSigningUp = signingUp;
    });
    this.isSigningUp = this.authService.isSigningUp;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const username = form.value.username;
    const email = form.value.email;
    const password = form.value.password;

    let loginObs: Observable<{
      data: { login: { token: string; userId: string } };
    }> = this.authService.login(email, password);

    if (this.authService.isSigningUp) {
      let signupObs: Observable<{
        data: { createUser: { _id: string; email: string } };
      }> = this.authService.signUp(username, email, password);
      signupObs.subscribe(
        () => {
          this.authService.setIsSigningUpTo(false);
          loginObs.subscribe((resData) => {
            this.authService.setLocalStorage(
              resData.data.login.token,
              resData.data.login.userId
            );
            this.authService.setIsAuthenticatedTo(true);
            this.authService.setAutoLogout()
            this.router.navigate(['/items']);
          });
        },
        (errorMessage) => {
          this.error = errorMessage;
          console.log(errorMessage);
        }
      );
    } else {
      loginObs.subscribe((resData) => {
        this.authService.setLocalStorage(
          resData.data.login.token,
          resData.data.login.userId
        );
        this.authService.setIsAuthenticatedTo(true);
        this.authService.setAutoLogout()
        this.router.navigate(['/items']);
      });
    }

    // form.reset();
  }

  onSwitchMode() {
    this.authService.setIsSigningUpTo(!this.isSigningUp);
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
