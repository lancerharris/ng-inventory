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

  constructor(
    private itemManager: ItemManagementService,
    private itemInputService: ItemInputService,
    private templateService: TemplateService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.addingTemplate = this.router.url === '/items/add-template';
    this.totalInputs = this.itemInputService.totalInputs;
    this.templates = Object.keys(this.templateService.localTemplates);
    this.templatesSub = this.templateService.addTemplateSubject.subscribe(
      () => {
        this.templates = Object.keys(this.templateService.localTemplates);
      }
    );
  }

  onTopToolsClick(event) {
    if (event.target instanceof HTMLDivElement) {
      this.sidenav.close();
    }
  }

  onAddInput() {
    this.sidenav.close();
    this.itemInputService.AddInput();
  }

  onEditClick() {
    this.sidenav.close();
    this.editMode = !this.editMode;
  }

  onDelete() {
    this.sidenav.close();
    this.itemInputService.setLongFieldIndex(-1);
    this.itemInputService.removeInputs(0, this.totalInputs.length);
  }

  onSubmit() {
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

    this.sidenav.close();
  }

  overwrite(templateName: string): void {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      width: '22rem',
      restoreFocus: false,
      data: {
        title: 'Would you like to overwrite the existing template?',
        templateName: templateName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  onSaveTemplate(): void {
    const dialogRef = this.dialog.open(DialogActionCancelComponent, {
      width: '17rem',
      restoreFocus: false,
      data: { title: 'Name your template', templateName: '' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // const templateExists = this.templateService.checkTemplateExists(result);
        const templateExists = true;
        if (templateExists) {
          this.overwrite(result);
          // todo: modal popup asking to overwrite
        }
        console.log(result);
        this.templateService.addToTemplates(result);
      }
    });
    this.sidenav.close();
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
    if (longFieldIndex) {
      this.itemInputService.setLongFieldIndex(longFieldIndex);
    } else {
      this.itemInputService.setLongFieldIndex(-1);
    }
    this.templateService.selectTemplateSubject.next();
    this.sidenav.close();
  }

  ngOnDestroy(): void {
    this.templatesSub.unsubscribe();
  }
}
