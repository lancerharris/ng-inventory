import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

import { ItemManagementService } from '../item-management.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css'],
})
export class AddItemComponent implements OnInit {
  @ViewChild('sidenav') sidenav: MatSidenav;

  public templates: string[] = ['Tops', 'Dresses', 'Bottoms'];
  public addingTemplate: boolean;
  public value: string = '';
  public editMode: boolean = false;
  private templatName: string;

  constructor(
    private itemManager: ItemManagementService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.addingTemplate = this.router.url === '/items/add-template';
  }

  onTopToolsClick(event) {
    if (event.target instanceof HTMLDivElement) {
      this.sidenav.close();
    }
  }

  onAddInput() {
    const currentLength = this.itemManager.totalInputs.length;
    if (currentLength <= 19) {
      // to keep track of the indices of the input elements
      this.itemManager.totalInputs.push(currentLength);
    } // else pop up to tell user no

    this.sidenav.close();
  }
  onSubmit() {
    let form: NgForm;
    const fields: string[] = [];
    const values: string[] = [];

    this.itemManager.totalInputs.forEach((index) => {
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
      data: { templateName: this.templatName },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.templatName = result;
      console.log(result);
    });
    this.sidenav.close();
  }
}
