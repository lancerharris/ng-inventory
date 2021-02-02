import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ItemManagementComponent } from './item-management.component';
import { AddItemComponent } from './add-item/add-item.component';
import { AllItemsComponent } from './all-items/all-items.component';
import { ReviewItemComponent } from './review-item/review-item.component';
import { ItemManagementRoutingModule } from './item-management-routing.module';




@NgModule({
  declarations: [
    ItemManagementComponent,
    AddItemComponent,
    AllItemsComponent,
    ReviewItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ItemManagementRoutingModule
  ]
})
export class ItemManagementModule { }
