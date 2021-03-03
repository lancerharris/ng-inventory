import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean;
  authSub: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService.authenticationChanged.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;
      }
    );
  }

  onSignUp(): void {
    this.authService.setIsSigningUpTo(true);
  }
  onLogin(): void {
    this.authService.setIsSigningUpTo(false);
  }

  onLogout(): void {
    this.authService.logoutHandler();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  onHamburgerClick() {}
}
