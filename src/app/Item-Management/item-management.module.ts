import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {DragDropModule} from '@angular/cdk/drag-drop';


import { ItemManagementComponent } from './item-management.component';
import { AddItemComponent } from './add-item/add-item.component';
import { AllItemsComponent } from './all-items/all-items.component';
import { ReviewItemComponent } from './review-item/review-item.component';
import { ItemManagementRoutingModule } from './item-management-routing.module';
import { ItemInputComponent } from './item-input/item-input.component';




@NgModule({
  declarations: [
    ItemManagementComponent,
    AddItemComponent,
    AllItemsComponent,
    ReviewItemComponent,
    ItemInputComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ItemManagementRoutingModule,
    MatSidenavModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatDividerModule,
    MatChipsModule,
    DragDropModule
  ]
})
export class ItemManagementModule { }
