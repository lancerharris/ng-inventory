import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AddItemComponent } from '../../item-management/add-item/add-item.component';

@Component({
  selector: 'app-dialog-yes-no',
  templateUrl: './dialog-yes-no.component.html',
  styleUrls: ['./dialog-yes-no.component.css'],
})
export class DialogYesNoComponent {
  constructor(
    public dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title1: string;
      title2: string;
      title3: string;
    }
  ) {}

  onNo(): void {
    this.dialogRef.close();
  }
}
