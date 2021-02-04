import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSignUp(): void {
    this.authService.setIsSigningUpTo(true);
  }
  onLogin(): void {
    this.authService.setIsSigningUpTo(false);
  }
}
