import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddItemComponent } from '../../item-management/add-item/add-item.component';

@Component({
  selector: 'app-dialog-action-cancel',
  templateUrl: './dialog-action-cancel.component.html',
  styleUrls: ['./dialog-action-cancel.component.css'],
})
export class DialogActionCancelComponent {
  constructor(
    public dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { title: string; templateName: string; cancelText: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
