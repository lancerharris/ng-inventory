import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessagingService } from '../services/messaging.service';
import { ItemInputService } from './item-input.service';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  public currentTemplate: string;
  public localTemplates;

  public localTemplatesSubject = new Subject<void>();
  public selectTemplateSubject = new Subject<void>();

  constructor(
    private itemInputService: ItemInputService,
    private http: HttpClient,
    private messagingService: MessagingService
  ) {}

  checkTemplateExists(templateName: string): boolean {
    return this.localTemplates[templateName] ? true : false;
  }

  addToTemplates(templateName: string, overwrite: boolean = false) {
    const fields = ['name', ...this.itemInputService.itemFields];
    const values = [templateName, ...this.itemInputService.itemValues];
    const longFieldIndex = this.itemInputService.getLongFieldIndex().toString();

    let graphqlQuery;
    if (overwrite) {
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
          id: this.localTemplates[templateName].id,
          gemInput: { fields, values },
          longFieldIndex: longFieldIndex,
          isTemplate: true,
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
          isTemplate: true,
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

        const templateId = resData.data[operation].values[idIndex];
        this.localTemplates[templateName] = {
          fields: fields.slice(1), // slice at 1 to drop the name field
          values: values.slice(1),
          id: templateId,
        };

        if (+longFieldIndex > -1) {
          this.localTemplates[templateName]['longFieldIndex'] = +longFieldIndex;
        }
        this.currentTemplate = templateName;
        this.localTemplatesSubject.next();
      });
  }

  getTemplates() {
    this.localTemplates = {};
    const graphqlQuery = {
      query: `
        query getTemplates($getTemplates: Boolean!) {
          getGems(getTemplates: $getTemplates) {
            gems {
              fields
              values
            }
          }
        }
      `,
      variables: {
        getTemplates: true,
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
        // this.localTemplates = {};
        resData.data.getGems.gems.forEach((gem) => {
          const nameIndex = gem.fields.findIndex((el) => el === 'name');
          const name = gem.values[nameIndex];
          gem.fields.splice(nameIndex, 1);
          gem.values.splice(nameIndex, 1);

          const longFieldIndexIndex = gem.fields.findIndex(
            (el) => el === 'longFieldIndex'
          );
          let longFieldIndex;
          if (longFieldIndexIndex > -1) {
            longFieldIndex = gem.values[longFieldIndexIndex];
            gem.fields.splice(longFieldIndexIndex, 1);
            gem.values.splice(longFieldIndexIndex, 1);
          }

          const idIndex = gem.fields.findIndex((el) => el === '_id');
          const templateId = gem.values[idIndex];
          gem.fields.splice(idIndex, 1);
          gem.values.splice(idIndex, 1);

          this.localTemplates[name] = {
            fields: gem.fields,
            values: gem.values,
            longFieldIndex: longFieldIndex ? +longFieldIndex : -1,
            id: templateId,
          };
        });

        this.localTemplatesSubject.next();
      });
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
