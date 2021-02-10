import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isSigningUp: boolean = false;
  authModeChanged = new Subject<boolean>();
  isAuthenticated: boolean = false;
  authenticationChanged = new Subject<boolean>();
  autoLogoutMinutes = 120

  constructor(private http: HttpClient) {}

  setIsSigningUpTo(signingUp) {
    this.isSigningUp = signingUp;
    this.authModeChanged.next(this.isSigningUp);
  }

  setIsAuthenticatedTo(authenticated) {
    this.isAuthenticated = authenticated;
    this.authenticationChanged.next(this.isAuthenticated);
  }

  signUp(username: string, email: string, password: string) {
    const graphqlQuery = {
      query: `
        mutation CreateNewUser($username: String!, $email: String!, $password: String!) {
            createUser(userInput: {email: $email, username: $username, password: $password}) {
              _id
              email
            }
        }
      `,
      variables: {
        username: username,
        email: email,
        password: password,
      },
    };
    return this.http
      .post<{ data: {createUser: {_id: string; email: string }}}>(
        'http://localhost:3000/graphql',
        JSON.stringify(graphqlQuery),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        catchError(this.handleError.bind(null, true))
      );
  }


  login(email: string, password: string) {
    const graphqlQuery = {
      query: `
        query UserLogin($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            userId
          }
        }
      `,
      variables: {
        email: email,
        password: password
      }
    }
    return this.http
      .post<{ data: {login: {token: string; userId: string }}}>(
        'http://localhost:3000/graphql',
        JSON.stringify(graphqlQuery),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        catchError(this.handleError.bind(null, false))
      );
  }

  
  private handleError( isSigningUp: boolean, errorRes: HttpErrorResponse) {
    console.log(errorRes);
    let errorMessage = isSigningUp ? 'unknown error. user creation failed': 'unknown error. login failed';
    if (!errorRes.error || !errorRes.error.errors) {
      return throwError(errorMessage);
    }
    if (errorRes.error.errors[0].status === 422) {
      errorMessage = errorRes.error.errors[0].message
    } else if (errorRes.error.errors[0].status === 401) {
      errorMessage = errorRes.error.errors[0].message
    }
    return throwError(errorMessage);
  }

  setLocalStorage(token: string, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    const remainingMilliseconds = 60 * 60 * 1000;
    const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
    localStorage.setItem('expiryDate', expiryDate.toISOString());
  }

  setAutoLogout = () => {
    setTimeout(() => {
      this.logoutHandler();
    }, this.autoLogoutMinutes * 60 * 1000);
  };

  logoutHandler = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
    this.setIsAuthenticatedTo(false);
  };
}
