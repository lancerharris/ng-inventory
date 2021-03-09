import { Component, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

import { ItemManagementService } from '../item-management.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { ItemInputService } from '../item-input.service';
import { TemplateService } from '../template.service';

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
    this.templatesSub = this.templateService.templatesSubject.subscribe(() => {
      this.templates = Object.keys(this.templateService.localTemplates);
    });
  }

  onTopToolsClick(event) {
    if (event.target instanceof HTMLDivElement) {
      this.sidenav.close();
    }
  }

  onAddInput() {
    this.itemInputService.AddInput();
    this.sidenav.close();
  }

  onEditClick() {
    this.editMode = !this.editMode;
  }

  onDelete() {
    this.itemInputService.removeInputs(0, this.totalInputs.length);
    this.itemInputService.setLongFieldIndex(-1);
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

    console.log(gemInput);

    let addItemObs: Observable<{
      data: { createGem: { fields: string[]; values: string[] } };
    }> = this.itemManager.addItem(gemInput, longField);

    addItemObs.subscribe((resData) => {});

    // form.reset();

    this.sidenav.close();
  }

  onSaveTemplate(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      restoreFocus: false,
      data: { templateName: '' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.templateService.currentTemplate = result;
      this.templateService.addToTemplates(result);
    });
    this.sidenav.close();
  }

  onTemplateSelect(template) {
    this.templateService.currentTemplate = template;
    this.onDelete();
    const fields = this.templateService.localTemplates[template]['fields'];
    const values = this.templateService.localTemplates[template]['values'];
    for (let i = 0; i < fields.length; i++) {
      this.onAddInput();
      this.itemInputService.itemFields.push(fields[i]);
      this.itemInputService.itemValues.push(values[i]);
    }
    this.itemInputService.templateSelectSubject.next();
  }

  ngOnDestroy(): void {
    this.templatesSub.unsubscribe();
  }
}
