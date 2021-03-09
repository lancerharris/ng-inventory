import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ItemInputService } from './item-input.service';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  public currentTemplate: string;
  public localTemplates = {
    Tops: {
      fields: ['category', 'prices', 'color'],
      values: ['temp', '', ''],
    },
    Dresses: {
      fields: ['category', 'price', 'color', 'inseam', 'rise'],
      values: ['', '', '', '', ''],
    },
    Bottoms: {
      fields: ['category', 'price', 'color', 'Dress Length'],
      values: ['', '', '', ''],
    },
  };

  public addTemplateSubject = new Subject<void>();
  public selectTemplateSubject = new Subject<void>();

  constructor(private itemInputService: ItemInputService) {}

  addToTemplates(templateName: string) {
    this.localTemplates[templateName] = {
      fields: [...this.itemInputService.itemFields],
      values: [...this.itemInputService.itemValues],
    };
    const longFieldIndex = this.itemInputService.getLongFieldIndex();
    if (longFieldIndex > -1) {
      this.localTemplates[templateName]['longFieldIndex'] = longFieldIndex;
    }
    this.currentTemplate = templateName;
    this.addTemplateSubject.next();
  }
}
