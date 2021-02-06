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
    this.authSub = this.authService.authModeChanged.subscribe(
      (signingUp) => {
        this.isSigningUp = signingUp;
      }
    )
    this.isSigningUp = this.authService.isSigningUp;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const username = form.value.username;
    const email = form.value.email;
    const password = form.value.password;

    let authObs: Observable<{_id: string, email: string}>;

    if (this.isSigningUp) {
      authObs = this.authService.signUp(username, email, password);
    } else {
      // authObs = this.authService.login(username, email, password);
      console.log('no login setup yet');
    }

    authObs.subscribe(
      (resData) => {
        console.log(resData);
        this.authService.setIsSigningUpTo(false);
        // this.router.navigate(['/items']);
      },
      (errorMessage) => {
        console.log(this.error);
        this.error = errorMessage;
        this.authService.setIsSigningUpTo(false);
      }
    );

    form.reset();
  }

  onSwitchMode() {
    this.authService.setIsSigningUpTo(!this.isSigningUp)
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
