import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ItemManagementService {
  totalInputs: [number] = [0];
  MAX_INPUTS: number = 20;
  private longFieldIndex: number;
  longFieldSubject = new Subject<number>();
  inputAdded = new Subject<number>();
  constructor(private http: HttpClient) {}

  removeInputs(inputIndex, removeN = 1) {
    this.totalInputs.splice(inputIndex, removeN);
  }

  AddInput() {
    if (this.totalInputs.length <= this.MAX_INPUTS - 1) {
      // to keep track of the indices of the input elements
      this.totalInputs.push(this.totalInputs.length);
      this.inputAdded.next(this.totalInputs.length - 1);
    } // else pop up to tell user no
  }

  getLongFieldIndex() {
    if (!this.longFieldIndex) {
      return -1;
    }
    return this.longFieldIndex;
  }

  setLongFieldIndex(index) {
    this.longFieldIndex = index;
    this.longFieldSubject.next(this.longFieldIndex);
  }

  addItem(gemInput: { fields: string[]; values: string[] }, longField: string) {
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
        longField: longField,
      },
    };
    return this.http
      .post<{ data: { createGem: { fields: string[]; values: string[] } } }>(
        'http://localhost:3000/graphql',
        JSON.stringify(graphqlQuery),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(errorRes: HttpErrorResponse) {
    console.log(errorRes);
    let errorMessage = 'unknown error. failed to add item';
    if (!errorRes.error || !errorRes.error.errors) {
      return throwError(errorMessage);
    }
    if (errorRes.error.errors[0].status === 422) {
      errorMessage = errorRes.error.errors[0].message;
    } else if (errorRes.error.errors[0].status === 401) {
      errorMessage = errorRes.error.errors[0].message;
    }
    return throwError(errorMessage);
  }
}
