import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';

import { SnackbarSimpleMessageComponent } from './snackbar-simple-message/snackbar-simple-message.component';
import { SnackbarErrorMessageComponent } from './snackbar-error-message/snackbar-error-message.component';

@NgModule({
  declarations: [SnackbarSimpleMessageComponent, SnackbarErrorMessageComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatRippleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatTableModule,
    MatCheckboxModule,
    MatGridListModule,
    MatInputModule,
    MatChipsModule,
    DragDropModule,
    MatListModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatStepperModule,
  ],
  exports: [
    MatToolbarModule,
    MatButtonModule,
    MatRippleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatTableModule,
    MatCheckboxModule,
    MatGridListModule,
    MatInputModule,
    MatChipsModule,
    DragDropModule,
    MatListModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatStepperModule,
  ],
})
export class MaterialsModule {}
