import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIcon, MatIconModule} from '@angular/material/icon';

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
    ItemManagementRoutingModule,
    MatSidenavModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatGridListModule,
    MatIconModule
  ]
})
export class ItemManagementModule { }
