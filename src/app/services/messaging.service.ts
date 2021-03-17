import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarSimpleMessageComponent } from '../materials/snackbar-simple-message/snackbar-simple-message.component';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private DURATION_IN_SECONDS = 300;

  constructor(private _snackBar: MatSnackBar) {}

  simpleMessage(
    mainText: string,
    emphasisText?: string,
    secondaryText?: string
  ) {
    this._snackBar.openFromComponent(SnackbarSimpleMessageComponent, {
      duration: this.DURATION_IN_SECONDS * 1000,
      data: {
        mainText: mainText,
        emphasisText: emphasisText,
        secondaryText: secondaryText,
      },
    });
  }
}
