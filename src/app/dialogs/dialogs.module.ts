import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogYesNoComponent } from '../dialogs/dialog-yes-no/dialog-yes-no.component';
import { MaterialsModule } from '../materials/materials.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DialogActionCancelComponent } from './dialog-action-cancel/dialog-action-cancel.component';
import { DialogTemplateEditComponent } from './dialog-template-edit/dialog-template-edit.component';
import { DialogTemplateSaveComponent } from './dialog-template-save/dialog-template-save.component';

@NgModule({
  declarations: [
    DialogActionCancelComponent,
    DialogYesNoComponent,
    DialogTemplateEditComponent,
    DialogTemplateSaveComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialsModule],
  exports: [DialogActionCancelComponent, DialogYesNoComponent],
})
export class DialogsModule {}
