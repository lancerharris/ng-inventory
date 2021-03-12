import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogYesNoComponent } from '../dialogs/dialog-yes-no/dialog-yes-no.component';
import { MaterialsModule } from '../materials/materials.module';
import { FormsModule } from '@angular/forms';
import { DialogActionCancelComponent } from './dialog-action-cancel/dialog-action-cancel.component';

@NgModule({
  declarations: [DialogActionCancelComponent, DialogYesNoComponent],
  imports: [CommonModule, FormsModule, MaterialsModule],
  exports: [DialogActionCancelComponent, DialogYesNoComponent],
})
export class DialogsModule {}
