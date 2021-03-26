import { Component, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

import { MatDialog } from '@angular/material/dialog';
import { DialogActionCancelComponent } from '../../dialogs/dialog-action-cancel/dialog-action-cancel.component';
import { ItemInputService } from '../item-input.service';
import { ItemCrudService } from '../item-crud.service';
import { DialogYesNoComponent } from 'src/app/dialogs/dialog-yes-no/dialog-yes-no.component';
import { DialogTemplateEditComponent } from 'src/app/dialogs/dialog-template-edit/dialog-template-edit.component';
import { MessagingService } from 'src/app/services/messaging.service';
import { DialogTemplateSaveComponent } from 'src/app/dialogs/dialog-template-save/dialog-template-save.component';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css'],
})
export class AddItemComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav: MatSidenav;

  public templates: string[];
  public value: string = '';
  public editMode: boolean = false;
  public selectedTemplate: string;

  public totalInputs: number[];
  private templatesSub: Subscription;
  private selectTemplateSub: Subscription;

  constructor(
    private itemInputService: ItemInputService,
    private itemCrudService: ItemCrudService,
    public dialog: MatDialog,
    private messagingService: MessagingService
  ) {}

  ngOnInit(): void {
    this.totalInputs = this.itemInputService.totalInputs;
    if (!this.itemCrudService.localTemplates) {
      this.itemCrudService.getItems(true);
    } else {
      this.templates = Object.keys(this.itemCrudService.localTemplates);
    }
    this.templatesSub = this.itemCrudService.localTemplatesSubject.subscribe(
      () => {
        this.templates = Object.keys(this.itemCrudService.localTemplates);
      }
    );

    this.selectTemplateSub = this.itemCrudService.selectTemplateSubject.subscribe(
      () => {
        this.selectedTemplate = this.itemCrudService.currentTemplate;
      }
    );
  }

  cleanUp() {
    this.sidenav.close();
    this.editMode = false;
  }

  onTopToolsClick(event) {
    if (event.target instanceof HTMLDivElement) {
      this.cleanUp();
    }
  }

  onAddInput(field?, value?) {
    this.cleanUp();
    field = field ? field : '';
    value = value ? value : '';
    this.itemInputService.AddInput(field, value);
  }

  onEditClick() {
    this.sidenav.close();
    this.editMode = !this.editMode;
  }

  onEditTemplates() {
    this.cleanUp();
    const dialogRef = this.dialog.open(DialogTemplateEditComponent, {
      width: '48rem',
      restoreFocus: false,
      data: {
        templateNames: this.templates,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'renaming' || result === 'deleting') {
      } else {
        this.messagingService.simpleMessage('Template Edit Canceled');
      }
    });
  }

  onClear() {
    this.cleanUp();
    this.itemInputService.setLongFieldIndex(-1);
    if (this.selectedTemplate) {
      this.onSelectTemplate(this.selectedTemplate);
    } else {
      this.itemInputService.removeInputs(0, this.totalInputs.length);
    }
  }

  async onSaveItem() {
    this.editMode = false;

    const saved: boolean = await this.itemCrudService.createItem(false, false);
    if (saved) {
      this.onSelectTemplate(this.selectedTemplate);
    }
    this.cleanUp();
  }

  overwriteTemplate(templateName: string): void {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      width: '22rem',
      autoFocus: false,
      restoreFocus: false,
      data: {
        title1: 'Are you sure you want to overwrite the ',
        title2: templateName,
        title3: ' template?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'overwrite') {
        this.itemCrudService.addToTemplates(templateName, true);
      } else {
        this.messagingService.simpleMessage('Template Save Canceled');
      }
    });
  }

  onSaveTemplate(): void {
    this.editMode = false;
    const dialogRef = this.dialog.open(DialogTemplateSaveComponent, {
      width: '48rem',

      restoreFocus: false,
      data: {
        templateNames: this.templates,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        this.messagingService.simpleMessage('Template Save Canceled');
      }
    });
    this.cleanUp();
  }

  onSelectTemplate(template: string) {
    this.itemInputService.removeInputs(0, this.totalInputs.length);
    const fields = this.itemCrudService.localTemplates[template]['fields'];
    const values = this.itemCrudService.localTemplates[template]['values'];
    const longFieldIndex = this.itemCrudService.localTemplates[template][
      'longFieldIndex'
    ];

    const inputLength =
      fields.length > values.length ? fields.length : values.length;
    for (let i = 0; i < inputLength; i++) {
      if (i < inputLength - 1) {
        this.onAddInput(); // we start with already having 1 input
      }

      this.itemInputService.itemFields[i] = fields[i];
      this.itemInputService.itemValues[i] = values[i];
    }

    if (longFieldIndex > -1) {
      this.itemInputService.setLongFieldIndex(longFieldIndex);
    } else {
      this.itemInputService.setLongFieldIndex(-1);
    }
    this.itemCrudService.setCurrentTemplate(template);
    this.cleanUp();
  }

  onDeselectTemplate() {
    this.itemCrudService.setCurrentTemplate(null);
    this.cleanUp();
  }

  ngOnDestroy(): void {
    this.templatesSub.unsubscribe();
    this.selectTemplateSub.unsubscribe();
  }
}
