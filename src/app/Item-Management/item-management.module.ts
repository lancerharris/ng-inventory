import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ItemManagementRoutingModule } from './item-management-routing.module';
import { MaterialsModule } from '../materials/materials.module';
import { ItemManagementComponent } from './item-management.component';
import { AddItemComponent } from './add-item/add-item.component';
import { AllItemsComponent } from './all-items/all-items.component';
import { ReviewItemComponent } from './review-item/review-item.component';
import { ItemInputComponent } from './item-input/item-input.component';
import { InputSelectDirective } from './input-select.directive';
import { DialogsModule } from '../dialogs/dialogs.module';
import { TableCellDirective } from './all-items/table-cell.directive';
import { InputEditDirective } from './item-input/input-edit.directive';

@NgModule({
  declarations: [
    ItemManagementComponent,
    AddItemComponent,
    AllItemsComponent,
    ReviewItemComponent,
    ItemInputComponent,
    InputSelectDirective,
    TableCellDirective,
    InputEditDirective,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ItemManagementRoutingModule,
    MaterialsModule,
    DialogsModule,
  ],
})
export class ItemManagementModule {}
