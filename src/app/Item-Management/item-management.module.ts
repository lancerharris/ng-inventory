import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemManagementComponent } from './item-management.component';
import { AddItemComponent } from './add-item/add-item.component';
import { AllItemsComponent } from './all-items/all-items.component';
import { ReviewItemComponent } from './review-item/review-item.component';



@NgModule({
  declarations: [
    ItemManagementComponent,
    AddItemComponent,
    AllItemsComponent,
    ReviewItemComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ItemManagementModule { }
