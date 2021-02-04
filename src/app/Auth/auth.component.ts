import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: [],
})
export class AuthComponent implements OnInit, OnDestroy {
  isSigningUp: boolean;
  authSub: Subscription;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService.authModeChanged.subscribe(
      (signingUp) => {
        this.isSigningUp = signingUp;
      }
    )
    this.isSigningUp = this.authService.isSigningUp;
    console.log('component starting with ' + this.isSigningUp);
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    // let authObs: Observable<AuthResponseData>;

    // authObs.subscribe(
    //   (resData) => {
    //     console.log(resData);
    //     this.isLoading = false;
    //     this.router.navigate(['/recipes']);
    //   },
    //   (errorMessage) => {
    //     this.error = errorMessage;
    //     this.isLoading = false;
    //   }
    // );

    form.reset();
  }

  onSwitchMode() {
    this.authService.setIsSigningUpTo(!this.isSigningUp)
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
