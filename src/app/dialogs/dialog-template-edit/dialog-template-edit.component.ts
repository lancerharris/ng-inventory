import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TemplateService } from '../../item-management/template.service';
import { AddItemComponent } from '../../item-management/add-item/add-item.component';

@Component({
  selector: 'app-dialog-template-edit',
  templateUrl: './dialog-template-edit.component.html',
  styleUrls: ['./dialog-template-edit.component.css'],
})
export class DialogTemplateEditComponent implements OnInit {
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public templates;
  public selectedTemplate: string;
  public action: string;

  constructor(
    private _formBuilder: FormBuilder,
    private templateService: TemplateService,
    public dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      templateNames: string[];
    }
  ) {}

  ngOnInit(): void {
    this.templates = this.templateService.localTemplates;
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
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

  onSaveTemplate() {
    this.templateService.renameTemplate(this.selectedTemplate);
  }

  onDeleteTemplate() {
    this.templateService.deleteTemplate(this.selectedTemplate);
  }
}
