import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ItemCrudService } from '../../item-management/item-crud.service';
import { AddItemComponent } from '../../item-management/add-item/add-item.component';

@Component({
  selector: 'app-dialog-template-edit',
  templateUrl: './dialog-template-edit.component.html',
  styleUrls: ['./dialog-template-edit.component.css'],
})
export class DialogTemplateEditComponent implements OnInit {
  public firstFormGroup: FormGroup;

  public templates;
  public selectedTemplate: string;
  public action: string;

  constructor(
    private _formBuilder: FormBuilder,
    private ItemCrudService: ItemCrudService,
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
  }

  onRenameTemplate() {
    this.ItemCrudService.renameTemplate(
      this.selectedTemplate,
      this.firstFormGroup.value.firstCtrl
    );
    this.dialogRef.close('renaming');
  }

  onDeleteTemplate() {
    this.ItemCrudService.deleteItem({
      isTemplate: true,
      templateName: this.selectedTemplate,
    });
    this.dialogRef.close('deleting');
  }
}
