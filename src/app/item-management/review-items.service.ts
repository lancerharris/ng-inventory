import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ItemCrudService } from './item-crud.service';
import { ItemInputService } from './item-input.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewItemsService {
  public currItem: {
    _id: string;
    fields: string[];
    values: string[];
    longFieldIndex: number;
  };
  public itemIds: string[];
  public editedInputs: { fieldsEdited: boolean[]; valuesEdited: boolean[] } = {
    fieldsEdited: [],
    valuesEdited: [],
  };

  public currItemChangeSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private itemInputService: ItemInputService,
    private itemCrudService: ItemCrudService
  ) {
    this.itemIds = [
      '6054ed7ffbb9d91c34680b51',
      '6054ed64fbb9d91c34680b50',
      '6054cbebfbb9d91c34680b4f',
    ];
  }

  setCurrItem(currItem) {
    this.currItem = currItem;
    this.itemInputService.itemSelectedSubject.next();
  }

  getOneItem(itemId: string) {
    const graphqlQuery = {
      query: `
        query getOneItem($userId: String!, $id: ID!) {
          getOneGem(userId: $userId, id: $id) {
            fields
            values
          }
        }
      `,
      variables: {
        userId: localStorage.getItem('userId'),
        id: itemId,
      },
    };

    this.http
      .post<{
        data: {
          getOneGem: { fields: string[]; values: string[] };
        };
      }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe((resData) => {
        console.log(resData);
        const item = resData.data.getOneGem;
        const fields = item.fields;
        const values = item.values;

        const idIndex = fields.findIndex((el) => el === '_id');
        const itemId = values[idIndex];
        if (!this.itemCrudService.localItems[itemId]) {
          this.itemCrudService.addLocalItem(item);
        }
        const localItem = this.itemCrudService.localItems[itemId];

        this.setCurrItem({
          _id: itemId,
          fields: fields,
          values: values,
          longFieldIndex: localItem.longFieldIndex
            ? localItem.longFieldIndex
            : -1,
        });
        console.log(this.currItem);
      });
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
