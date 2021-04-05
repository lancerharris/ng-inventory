import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessagingService } from '../services/messaging.service';
import { ItemCrudService } from './item-crud.service';

@Injectable({
  providedIn: 'root',
})
export class TableManagementService {
  public localItemChanges = {};

  public localItemChangesSubject = new Subject<void>();
  public itemChangesSavedSubject = new Subject<void>();

  constructor(
    private itemCrudService: ItemCrudService,
    private http: HttpClient,
    private messagingService: MessagingService
  ) {}

  bulkDelete(deleteIds: string[]) {
    let graphqlQuery;
    graphqlQuery = {
      query: `
            mutation deleteManyItems($userId: String!, $deleteIds: [String!]!) {
              deleteManyGems(userId: $userId, deleteIds: $deleteIds)
            }
          `,
      variables: {
        userId: localStorage.getItem('userId'),
        deleteIds: deleteIds,
      },
    };

    this.http
      .post<{
        data: { deleteManyGems: boolean };
      }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe((resData) => {
        if (resData.data.deleteManyGems) {
          this.messagingService.simpleMessage('Items Deleted');
          deleteIds.forEach((id) => {
            delete this.itemCrudService.localItems[id];
            const tableItemIndex = this.itemCrudService.localTableItems.findIndex(
              (item) => item._id === id
            );
            this.itemCrudService.localTableItems.splice(tableItemIndex, 1);
          });
          this.itemCrudService.localItemsChangedSubject.next();
        } else {
          this.messagingService.simpleMessage('Item Deletion Failed');
        }
        // TODO: add error handling for false cases
      });
    return true; // shouldn't reach here if http error
  }

  saveItemChanges() {
    const itemsToStore = [];
    // make a copy so don't overwrite in case of http fail
    const itemsPriorToChange = {};
    Object.keys(this.localItemChanges).forEach((itemId) => {
      const fieldsToStore = [];
      const valuesToStore = [];
      Object.keys(this.localItemChanges[itemId]).forEach((field) => {
        itemsPriorToChange[itemId] = this.itemCrudService.localItems[itemId];
        const fieldIndex = this.itemCrudService.localItems[itemId][
          'fields'
        ].findIndex((el) => {
          return el === field;
        });
        if (fieldIndex > -1) {
          this.itemCrudService.localItems[itemId]['values'][
            fieldIndex
          ] = this.localItemChanges[itemId][field];
        } else {
          this.itemCrudService.localItems[itemId]['fields'].push(field);
          this.itemCrudService.localItems[itemId]['values'].push(
            this.localItemChanges[itemId][field]
          );
        }
        fieldsToStore.push(field);
        valuesToStore.push(this.localItemChanges[itemId][field]);
      });
      itemsToStore.push({
        _id: itemId,
        fields: fieldsToStore,
        values: valuesToStore,
      });
    });
    console.log(itemsToStore);
    // todo: use itemsToStore to store on mongo db. try a bulkwrite
    let graphqlQuery;
    graphqlQuery = {
      query: `
            mutation updateManyItems($userId: String!, $bulkItemInput: [BulkGemItem!]!) {
              updateManyGems(userId: $userId bulkGemInput: $bulkItemInput)
            }
          `,
      variables: {
        userId: localStorage.getItem('userId'),
        bulkItemInput: itemsToStore,
      },
    };

    this.http
      .post<{
        data: { updateManyGems: boolean };
      }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe((resData) => {
        if (resData.data.updateManyGems) {
          this.itemChangesSavedSubject.next();
        } else {
          //TODO revertlocal items
        }
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
