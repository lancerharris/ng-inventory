import { Component, OnInit } from '@angular/core';
import { AuthService } from '../Auth/auth.service';

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
    this.authService.isSigningUp = true;
  }
  onLogin(): void {
    this.authService.isSigningUp = false;
  }
}
