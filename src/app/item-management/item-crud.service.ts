import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessagingService } from '../services/messaging.service';
import { ItemInputService } from './item-input.service';

@Injectable({
  providedIn: 'root',
})
export class ItemCrudService {
  public currentTemplate: string;
  public localTemplates;
  public localItems = {};
  public localTableItems = []; // an array of objects with dynamic number of fields and values
  public localTableFields: string[] = [];

  public localTemplatesSubject = new Subject<void>();
  public selectTemplateSubject = new Subject<void>();
  public localItemsSubject = new Subject<void>();
  public itemCreatedSubject = new Subject<void>();

  constructor(
    private itemInputService: ItemInputService,
    private http: HttpClient,
    private messagingService: MessagingService
  ) {}

  checkTemplateExists(templateName: string): boolean {
    return this.localTemplates[templateName] ? true : false;
  }

  setCurrentTemplate(templateName: string) {
    if (templateName) {
      this.currentTemplate = templateName;
    } else {
      this.currentTemplate = null;
    }
    this.selectTemplateSubject.next();
    this.itemInputService.itemSelectedSubject.next();
  }

  addToTemplates(templateName: string, overwrite: boolean = false) {
    const fields = ['templateName', ...this.itemInputService.itemFields];
    const values = [templateName, ...this.itemInputService.itemValues];

    this.createItem(overwrite, true, fields, values, templateName);
  }

  createItem(
    overwrite: boolean = false,
    isTemplate: boolean,
    inputFields?: string[],
    inputValues?: string[],
    templateName?: string
  ) {
    const fields = inputFields
      ? inputFields
      : [...this.itemInputService.itemFields];
    const values = inputValues
      ? inputValues
      : [...this.itemInputService.itemValues];
    const longFieldIndex = this.itemInputService.getLongFieldIndex().toString();
    let graphqlQuery;
    if (overwrite) {
      const id = isTemplate
        ? this.localTemplates[templateName].id
        : 'need to add item id here';
      graphqlQuery = {
        query: `
            mutation addToTemplates($userId: String!, $id: ID!, $gemInput: GemInputData!, $longFieldIndex: String, $isTemplate: Boolean!) {
              replaceGem(userId: $userId, id: $id gemInput: $gemInput, longFieldIndex: $longFieldIndex, isTemplate: $isTemplate) {
                fields
                values
              }
            }
          `,
        variables: {
          userId: localStorage.getItem('userId'),
          id: id,
          gemInput: { fields, values },
          longFieldIndex: longFieldIndex,
          isTemplate: isTemplate,
        },
      };
    } else {
      graphqlQuery = {
        query: `
            mutation addToTemplates($userId: String!, $gemInput: GemInputData!, $longFieldIndex: String, $isTemplate: Boolean!) {
              createGem(userId: $userId, gemInput: $gemInput, longFieldIndex: $longFieldIndex, isTemplate: $isTemplate) {
                fields
                values
              }
            }
          `,
        variables: {
          userId: localStorage.getItem('userId'),
          gemInput: { fields, values },
          longFieldIndex: longFieldIndex,
          isTemplate: isTemplate,
        },
      };
    }

    this.http
      .post<{
        data: { [key: string]: { fields: string[]; values: string[] } };
      }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe((resData) => {
        const operation = overwrite ? 'replaceGem' : 'createGem';
        const idIndex = resData.data[operation].fields.findIndex(
          (el) => el === '_id'
        );

        if (isTemplate) {
          const templateId = resData.data[operation].values[idIndex];
          this.localTemplates[templateName] = {
            fields: fields.slice(1), // slice at 1 to drop the name field
            values: values.slice(1),
            id: templateId,
          };

          if (+longFieldIndex > -1) {
            this.localTemplates[templateName][
              'longFieldIndex'
            ] = +longFieldIndex;
          }
          this.setCurrentTemplate(templateName);
          this.localTemplatesSubject.next();
          this.messagingService.simpleMessage(
            'The ',
            templateName,
            ' template has been saved'
          );
        } else {
          this.messagingService.simpleMessage('Item Saved');
        }

        this.itemCreatedSubject.next();
      });
    // return true; // shouldn't reach here if http error. I don't think that's true.
  }

  getItems(getTemplates: boolean) {
    if (getTemplates) {
      this.localTemplates = {};
    } else {
      this.localItems = {};
      // reset the array to allow fresh table fields and get rid of unused ones
      this.localTableFields = [];
    }
    const graphqlQuery = {
      query: `
        query getItems($getTemplates: Boolean!) {
          getGems(getTemplates: $getTemplates) {
            gems {
              fields
              values
            }
          }
        }
      `,
      variables: {
        getTemplates: getTemplates,
      },
    };

    this.http
      .post<{
        data: {
          getGems: { gems: [{ fields: string[]; values: string[] }] };
        };
      }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe((resData) => {
        resData.data.getGems.gems.forEach((item) => {
          if (getTemplates) {
            this.addLocalTemplate(item);
          } else {
            // pass callingInLoop true to avoid calling updateTableFields too many times.
            this.addLocalItem(item, true);
          }
        });
        if (getTemplates) {
          this.localTemplatesSubject.next();
        } else {
          this.updateTableFields();
        }
      });
  }

  updateTableFields() {
    // to avoid confusing table, return only unique fields
    this.localTableFields = this.localTableFields.filter(
      (field, index, self) => {
        return self.indexOf(field) === index;
      }
    );
    this.localItemsSubject.next();
  }

  pullFromItem(
    item,
    istemplate: boolean = false
  ): { itemId: string; longFieldIndex?: number; templateName?: string } {
    const longFieldIndexIndex = item.fields.findIndex(
      (el) => el === 'longFieldIndex'
    );
    let longFieldIndex;
    if (longFieldIndexIndex > -1) {
      longFieldIndex = item.values[longFieldIndexIndex];
      item.fields.splice(longFieldIndexIndex, 1);
      item.values.splice(longFieldIndexIndex, 1);
    }

    const idIndex = item.fields.findIndex((el) => el === '_id');
    const itemId = item.values[idIndex];
    // splice id after getting it into the tableItem so that I can link table to item by id
    item.fields.splice(idIndex, 1);
    item.values.splice(idIndex, 1);

    const pulledFields = { itemId: itemId };

    if (longFieldIndex) {
      pulledFields['longFieldIndex'] = +longFieldIndex;
    }
    if (istemplate) {
      const nameIndex = item.fields.findIndex((el) => el === 'templateName');
      const templateName = item.values[nameIndex];
      item.fields.splice(nameIndex, 1);
      item.values.splice(nameIndex, 1);
      pulledFields['templateName'] = templateName;
    }

    return pulledFields;
  }

  addLocalTemplate(template) {
    const pulledFields = this.pullFromItem(template, true);

    this.localTemplates[pulledFields.templateName] = {
      fields: template.fields,
      values: template.values,
      longFieldIndex: pulledFields.longFieldIndex
        ? pulledFields.longFieldIndex
        : -1,
      id: pulledFields.itemId,
    };
  }

  addLocalItem(item, callingInLoop: boolean = false) {
    const tableItem = {};
    const itemIndex = this.localTableItems.length;

    item.fields.forEach((field, index) => {
      // no empty fields in the table since there can be multiple empty fields the data would be comingled
      if (field && field !== '') {
        const value = item.values[index];
        tableItem[field] = value ? value : '';
        if (field !== '_id' && field !== 'longFieldIndex') {
          this.localTableFields.push(field);
        }
      }
    });
    tableItem['rowIndex'] = itemIndex;

    // splice id after getting it into the tableItem so that I can link table to item by id
    const pulledValues = this.pullFromItem(item);

    // overwrite tableItem if already there
    const tableItemIndex = this.localTableItems.findIndex(
      (item) => item._id === pulledValues.itemId
    );
    if (tableItemIndex > -1) {
      this.localTableItems[tableItemIndex] = tableItem;
    } else {
      this.localTableItems.push(tableItem);
    }

    this.localItems[pulledValues.itemId] = {
      fields: item.fields,
      values: item.values,
      longFieldIndex: pulledValues.longFieldIndex
        ? pulledValues.longFieldIndex
        : -1,
    };
    if (!callingInLoop) {
      this.updateTableFields();
    }
  }

  renameTemplate(priorTemplateName: string, newTemplateName: string) {
    const templateId = this.localTemplates[priorTemplateName].id;

    let graphqlQuery;
    graphqlQuery = {
      query: `
            mutation renameTemplate($userId: String!, $templateId: ID!, $newTemplateName: String!) {
              renameTemplate(userId: $userId, id: $templateId, newTemplateName: $newTemplateName)
            }
          `,
      variables: {
        userId: localStorage.getItem('userId'),
        templateId: templateId,
        newTemplateName: newTemplateName,
      },
    };

    this.http
      .post<{
        data: { renameTemplate: boolean };
      }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe((resData) => {
        if (resData.data.renameTemplate) {
          this.localTemplates[newTemplateName] = this.localTemplates[
            priorTemplateName
          ];
          delete this.localTemplates[priorTemplateName];
          this.messagingService.simpleMessage(
            'Template renamed to ',
            newTemplateName
          );
          this.localTemplatesSubject.next();
        } else {
          this.messagingService.simpleMessage('Template renaming failed');
        }
      });
  }

  deleteTemplate(templateName: string, isTemplate: boolean) {
    const id = this.localTemplates[templateName].id;
    let graphqlQuery;
    graphqlQuery = {
      query: `
            mutation deleteGem($userId: String!, $id: ID!, $isTemplate: Boolean!) {
              deleteGem(userId: $userId, id: $id, isTemplate: $isTemplate)
            }
          `,
      variables: {
        userId: localStorage.getItem('userId'),
        id: id,
        isTemplate: isTemplate,
      },
    };
    this.http
      .post<{
        data: { deleteGem: boolean };
      }>('http://localhost:3000/graphql', JSON.stringify(graphqlQuery), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(catchError(this.handleError))
      .subscribe((resData) => {
        if (resData.data.deleteGem) {
          if (isTemplate) {
            delete this.localTemplates[templateName];
            this.messagingService.simpleMessage(
              'The ',
              templateName,
              ' template has been deleted'
            );
            this.localTemplatesSubject.next();
          }
        } else {
          this.messagingService.simpleMessage('Template delete failed');
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
