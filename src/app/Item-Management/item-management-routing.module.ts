import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddItemComponent } from './add-item/add-item.component';
import { AllItemsComponent } from './all-items/all-items.component';
import { ItemManagementComponent } from './item-management.component';
import { ReviewItemComponent } from './review-item/review-item.component';

const routes: Routes = [
  {
    path: '',
    component: ItemManagementComponent,
    children: [
      { path: '', component: AllItemsComponent },
      { path: 'add-item', component: AddItemComponent },
      { path: 'add-template', component: AddItemComponent },
      { path: ':id', component: ReviewItemComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemManagementRoutingModule {}
