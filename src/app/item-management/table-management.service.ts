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

  // saveItemChanges(): boolean {
  //   const itemsToStore = [];

  //   // make a copy so don't overwrite in case of http fail
  //   const localItems = { ...this.itemCrudService.localItems };
  //   Object.keys(localItems).forEach((item) => {
  //     Object.keys(localItems[item]).forEach((field) => {
  //       const fieldIndex = localItems[item]['fields'].findIndex((el) => {
  //         return el === field;
  //       });
  //       localItems[item]['values'][fieldIndex] = this.localItemChanges[item][
  //         field
  //       ];
  //     });
  //     itemsToStore.push({ [item]: localItems[item] });
  //   });

  //   // todo: use itemsToStore to store on mongo db. try a bulkwrite
  //   let graphqlQuery;
  //   graphqlQuery = {
  //     query: `
  //           mutation addToTemplates($userId: String!, $id: ID!, $gemInput: GemInputData!, $longFieldIndex: String, $isTemplate: Boolean!) {
  //             replaceGem(userId: $userId, id: $id gemInput: $gemInput, longFieldIndex: $longFieldIndex, isTemplate: $isTemplate) {
  //               fields
  //               values
  //             }
  //           }
  //         `,
  //     variables: {
  //       userId: localStorage.getItem('userId'),
  //       id: id,
  //       gemInput: { fields, values },
  //       longFieldIndex: longFieldIndex,
  //     },
  //   };

  //   this.http
  //     .post<{
  //       data: { [key: string]: { fields: string[]; values: string[] } };
  //     }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     })
  //     .pipe(catchError(this.handleError))
  //     .subscribe((resData) => {
  //       const operation = overwrite ? 'replaceGem' : 'createGem';
  //       const idIndex = resData.data[operation].fields.findIndex(
  //         (el) => el === '_id'
  //       );

  //       if (isTemplate) {
  //         const templateId = resData.data[operation].values[idIndex];
  //         this.localTemplates[templateName] = {
  //           fields: fields.slice(1), // slice at 1 to drop the name field
  //           values: values.slice(1),
  //           id: templateId,
  //         };

  //         if (+longFieldIndex > -1) {
  //           this.localTemplates[templateName][
  //             'longFieldIndex'
  //           ] = +longFieldIndex;
  //         }
  //         this.currentTemplate = templateName;
  //         this.localTemplatesSubject.next();
  //         this.messagingService.simpleMessage(
  //           'The ',
  //           templateName,
  //           ' template has been saved'
  //         );
  //       } else {
  //         this.messagingService.simpleMessage('Item Saved');
  //       }
  //     });
  //   return true; // shouldn't reach here if http error
  // }

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
