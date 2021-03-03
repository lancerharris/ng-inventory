import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css'],
})
export class AddItemComponent implements OnInit {
  public templates: string[] = ['Tops', 'Dresses', 'Bottoms'];
  public addingTemplate: boolean;
  public value: string = '';
  public reason: string = '';

  constructor(
    private itemManager: ItemManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addingTemplate = this.router.url === '/items/add-template';
  }

  onAddInput() {
    const currentLength = this.itemManager.totalInputs.length;
    if (currentLength <= 19) {
      // to keep track of the indices of the input elements
      this.itemManager.totalInputs.push(currentLength);
    }
    // else pop up to tell user no
  }

  onSubmit(form: NgForm) {
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
  }
}
