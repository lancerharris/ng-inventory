import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ItemManagementService {
  totalInputs: [number] = [0];
  constructor(private http: HttpClient) { }

  removeInput(inputIndex) {
    this.totalInputs.splice(inputIndex, 1);
  }

  addItem(gemInput: {fields: string[], values: string[]}, longField: string) {
    const graphqlQuery = {
      query: `
        mutation addItem($userId: String!, $gemInput: GemInputData!, $longField: String) {
          createGem(userId: $userId, gemInput: $gemInput, longField: $longField) {
            fields
          }
        }
      `,
      variables: {
        userId: localStorage.getItem('userId'),
        gemInput: gemInput,
        longField: longField
      }
    }
    return this.http
      .post<{data: {createGem: {fields: string[]; values: string[]}}}>(
        'http://localhost:3000/graphql',
        JSON.stringify(graphqlQuery),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        catchError(this.handleError)
      );
  }

  
  private handleError(errorRes: HttpErrorResponse) {
    console.log(errorRes);
    let errorMessage ='unknown error. failed to add item';
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
}
