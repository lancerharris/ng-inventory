import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'snackbar-simple-message',
  templateUrl: './snackbar-simple-message.component.html',
  styleUrls: ['./snackbar-simple-message.component.css'],
})
export class SnackbarSimpleMessageComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: {
      mainText: string;
      emphasisText: string;
      secondaryText: string;
    }
  ) {}
}
