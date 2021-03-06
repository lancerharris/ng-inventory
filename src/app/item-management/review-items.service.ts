import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessagingService } from '../services/messaging.service';
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
  public itemIds: string[] = [];
  public editedInputs: { fieldsEdited: boolean[]; valuesEdited: boolean[] } = {
    fieldsEdited: [],
    valuesEdited: [],
  };

  public itemReplacedSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private itemInputService: ItemInputService,
    private itemCrudService: ItemCrudService,
    private messagingService: MessagingService
  ) {}

  setCurrItem(currItem) {
    this.currItem = currItem;
    this.itemInputService.itemSelectedSubject.next();
  }

  dropReviewId(itemIndex) {
    this.itemIds.splice(itemIndex, 1);
  }

  resetEditedCells() {
    const fields = this.currItem['fields'];
    const values = this.currItem['values'];
    const itemLength = Math.max(fields.length, values.length);
    this.editedInputs.fieldsEdited = Array(itemLength).fill(false);
    this.editedInputs.valuesEdited = Array(itemLength).fill(false);
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
        // TODO: the no gem found case has to be handled. since its not an http error.

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
      });
  }

  replaceCurrItem() {
    const longFieldIndex = this.itemInputService.getLongFieldIndex();
    const graphqlQuery = {
      query: `
        mutation replaceItem($userId: String!, $id: ID!, $itemInput: GemInputData!, $longFieldIndex: String, $isTemplate: Boolean!) {
          replaceGem(userId: $userId, id: $id, gemInput: $itemInput, longFieldIndex: $longFieldIndex, isTemplate: $isTemplate) {
            fields
            values
          }
        }
      `,
      variables: {
        userId: localStorage.getItem('userId'),
        id: this.currItem._id,
        itemInput: {
          fields: this.itemInputService.itemFields,
          values: this.itemInputService.itemValues,
        },
        longFieldIndex: longFieldIndex.toString(),
        isTemplate: false,
      },
    };

    this.http
      .post<{
        data: {
          replaceGem: { fields: string[]; values: string[] };
        };
      }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe(() => {
        this.currItem.fields = [...this.itemInputService.itemFields];
        this.currItem.values = [...this.itemInputService.itemValues];
        this.currItem.longFieldIndex = this.itemInputService.getLongFieldIndex();
        this.messagingService.simpleMessage('Item Updated');
        this.resetEditedCells();
        this.itemReplacedSubject.next();
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
