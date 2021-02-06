import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isSigningUp: boolean = false;
  authModeChanged = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  setIsSigningUpTo(signingUp) {
    this.isSigningUp = signingUp;
    this.authModeChanged.next(this.isSigningUp);
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
      .post<{ _id: string; email: string }>(
        'http://localhost:3000/graphql',
        JSON.stringify(graphqlQuery),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          console.log('Signup response: ' + resData);
        })
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
      .post<{ token: string; userId: string }>(
        'http://localhost:3000/graphql',
        JSON.stringify(graphqlQuery),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          console.log(resData);
        })
      );
  }

  
  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    console.log(errorRes.error.error.message);
    return throwError(errorMessage);
  }
}
