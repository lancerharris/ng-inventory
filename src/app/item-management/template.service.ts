import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ItemInputService } from './item-input.service';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  public currentTemplate: string;
  public localTemplates;

  public addTemplateSubject = new Subject<void>();
  public selectTemplateSubject = new Subject<void>();

  constructor(
    private itemInputService: ItemInputService,
    private http: HttpClient
  ) {}

  checkTemplateExists(templateName: string): boolean {
    return this.localTemplates[templateName] ? true : false;
  }

  addToTemplates(templateName: string) {
    const fields = ['name', ...this.itemInputService.itemFields];
    const values = [templateName, ...this.itemInputService.itemValues];
    const longFieldIndex = this.itemInputService.getLongFieldIndex().toString();

    const graphqlQuery = {
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
    this.http
      .post<{ data: { createGem: { fields: string[]; values: string[] } } }>(
        'http://localhost:3000/graphql',
        JSON.stringify(graphqlQuery),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(catchError(this.handleError))
      .subscribe((resData) => {
        this.localTemplates[templateName] = {
          fields: fields.slice(1),
          values: values.slice(1),
        };
        if (+longFieldIndex > -1) {
          this.localTemplates[templateName]['longFieldIndex'] = +longFieldIndex;
        }
        this.currentTemplate = templateName;
        this.addTemplateSubject.next();
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
          const longFieldIndexIndex = gem.fields.findIndex(
            (el) => el === 'longFieldIndex'
          );

          let longFieldIndex;
          if (longFieldIndexIndex > -1) {
            longFieldIndex = gem.values[longFieldIndexIndex];
            gem.fields.splice(longFieldIndexIndex, 1);
            gem.values.splice(longFieldIndexIndex, 1);
          }
          gem.fields.splice(nameIndex, 1);
          gem.values.splice(nameIndex, 1);
          this.localTemplates[name] = {
            fields: gem.fields,
            values: gem.values,
            longFieldIndex: longFieldIndex ? +longFieldIndex : -1,
          };
        });

        this.addTemplateSubject.next();
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
