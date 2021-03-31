import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ItemCrudService } from '../../item-management/item-crud.service';
import { AddItemComponent } from '../../item-management/add-item/add-item.component';
import { MessagingService } from 'src/app/services/messaging.service';

@Component({
  selector: 'app-dialog-template-save',
  templateUrl: './dialog-template-save.component.html',
  styleUrls: ['./dialog-template-save.component.css'],
})
export class DialogTemplateSaveComponent implements OnInit {
  public firstFormGroup: FormGroup;
  public templates;
  public selectedTemplate: string;
  public action: string;
  public saveMessage: string = 'Save Template';
  public saveColor: string = 'accent';

  constructor(
    private _formBuilder: FormBuilder,
    private ItemCrudService: ItemCrudService,
    private messagingService: MessagingService,
    public dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      templateNames: string[];
    }
  ) {}

  ngOnInit(): void {
    this.templates = this.ItemCrudService.localTemplates;
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
  }

  onCancelEdit(): void {
    this.dialogRef.close();
  }

  onTemplateSelect(template: string) {
    const alreadySelected = this.selectedTemplate === template;
    this.selectedTemplate = alreadySelected ? null : template;
  }

  onActionSelect(action: string) {
    const alreadySelected = this.action === action;
    this.action = alreadySelected ? null : action;
    this.saveMessage =
      action === 'overwriteTemplate'
        ? 'Overwrite Selected Template'
        : 'Save Template';
    this.saveColor = action === 'overwriteTemplate' ? 'warn' : 'accent';
  }

  onSaveTemplate() {
    const doOverwrite = this.action === 'overwriteTemplate';
    const saveName = doOverwrite
      ? this.selectedTemplate
      : this.firstFormGroup.value.firstCtrl;

    this.ItemCrudService.addToTemplates(saveName, doOverwrite);
    this.dialogRef.close();
  }
}
