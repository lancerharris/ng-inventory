import {
  Component,
  KeyValueDiffers,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

import { ItemManagementService } from '../item-management.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogActionCancelComponent } from '../../dialogs/dialog-action-cancel/dialog-action-cancel.component';
import { ItemInputService } from '../item-input.service';
import { TemplateService } from '../template.service';
import { DialogYesNoComponent } from 'src/app/dialogs/dialog-yes-no/dialog-yes-no.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarSimpleMessageComponent } from 'src/app/materials/snackbar-simple-message/snackbar-simple-message.component';
import { DialogTemplateEditComponent } from 'src/app/dialogs/dialog-template-edit/dialog-template-edit.component';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css'],
})
export class AddItemComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav: MatSidenav;

  public templates: string[];
  public addingTemplate: boolean;
  public value: string = '';
  public editMode: boolean = false;

  public totalInputs: number[];
  private templatesSub: Subscription;
  private DURATION_IN_SECONDS = 3;

  constructor(
    private itemManager: ItemManagementService,
    private itemInputService: ItemInputService,
    private templateService: TemplateService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.addingTemplate = this.router.url === '/items/add-template';
    this.totalInputs = this.itemInputService.totalInputs;
    if (!this.templateService.localTemplates) {
      this.templateService.getTemplates();
    } else {
      this.templates = Object.keys(this.templateService.localTemplates);
    }
    this.templatesSub = this.templateService.addTemplateSubject.subscribe(
      () => {
        this.templates = Object.keys(this.templateService.localTemplates);
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

  onAddInput() {
    this.cleanUp();
    this.itemInputService.AddInput();
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
        this._snackBar.openFromComponent(SnackbarSimpleMessageComponent, {
          duration: this.DURATION_IN_SECONDS * 1000,
          data: {
            mainText: 'Template Edit Canceled',
          },
        });
      }
    });
  }

  onDelete() {
    this.cleanUp();
    this.itemInputService.setLongFieldIndex(-1);
    this.itemInputService.removeInputs(0, this.totalInputs.length);
  }

  onSubmit() {
    this.editMode = false;
    let form: NgForm;
    const fields: string[] = [];
    const values: string[] = [];

    this.totalInputs.forEach((index) => {
      const fieldInput = document.getElementById(
        'field_' + index
      ) as HTMLInputElement;
      const valueInput = document.getElementById(
        'value_' + index
      ) as HTMLInputElement;
      fields[index] = fieldInput.value;
      values[index] = valueInput.value;
    });

    const gemInput = { fields: fields, values: values };
    const longField = form.value.longField ? form.value.longField : null;

    let addItemObs: Observable<{
      data: { createGem: { fields: string[]; values: string[] } };
    }> = this.itemManager.addItem(gemInput, longField);

    addItemObs.subscribe((resData) => {});

    // form.reset();

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
        this.templateService.addToTemplates(templateName, true);
      } else {
        this._snackBar.openFromComponent(SnackbarSimpleMessageComponent, {
          duration: this.DURATION_IN_SECONDS * 1000,
          data: {
            mainText: 'Template Save Canceled',
          },
        });
      }
    });
  }

  onSaveTemplate(): void {
    this.editMode = false;
    const dialogRef = this.dialog.open(DialogActionCancelComponent, {
      width: '17rem',

      restoreFocus: false,
      data: {
        title: 'Name your template',
        templateName: '',
        cancelText: 'Template Save Canceled',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const templateExists = this.templateService.checkTemplateExists(result);
        if (templateExists) {
          this.overwriteTemplate(result);
        } else {
          this.templateService.addToTemplates(result, false);
        }
      } else {
        this._snackBar.openFromComponent(SnackbarSimpleMessageComponent, {
          duration: this.DURATION_IN_SECONDS * 1000,
          data: {
            mainText: 'Template Save Canceled',
          },
        });
      }
    });
    this.cleanUp();
  }

  onSelectTemplate(template) {
    this.templateService.currentTemplate = template;
    this.itemInputService.removeInputs(0, this.totalInputs.length);
    const fields = this.templateService.localTemplates[template]['fields'];
    const values = this.templateService.localTemplates[template]['values'];
    const longFieldIndex = this.templateService.localTemplates[template][
      'longFieldIndex'
    ];

    const inputLength =
      fields.length > values.length ? fields.length : values.length;
    for (let i = 0; i < inputLength; i++) {
      if (i < inputLength - 1) {
        this.onAddInput(); // we start with already having 1 input
      }
      this.itemInputService.itemFields.push(fields[i]);
      this.itemInputService.itemValues.push(values[i]);
    }
    if (longFieldIndex > -1) {
      this.itemInputService.setLongFieldIndex(longFieldIndex);
    } else {
      this.itemInputService.setLongFieldIndex(-1);
    }
    this.templateService.selectTemplateSubject.next();
    this.cleanUp();
  }

  ngOnDestroy(): void {
    this.templatesSub.unsubscribe();
  }
}
