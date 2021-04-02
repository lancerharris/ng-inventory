import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar-error-message',
  templateUrl: './snackbar-error-message.component.html',
  styleUrls: ['./snackbar-error-message.component.css'],
})
export class SnackbarErrorMessageComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: {
      mainText: string;
      emphasisText: string;
      secondaryText: string;
    }
  ) {}
}
