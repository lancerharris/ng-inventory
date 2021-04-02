import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemInputService {
  itemFields: string[] = [''];
  itemValues: string[] = [''];
  totalInputs: number[] = [0];
  MAX_INPUTS: number = 20;
  MAX_VALUE_LENGTH: number = 80;
  private longFieldIndex: number = -1;
  public longFieldSubject = new Subject<number>();
  public inputAdded = new Subject<number>();
  public itemSelectedSubject = new Subject<number>();

  constructor() {}

  removeInputs(inputIndex, removeN = 1) {
    this.totalInputs.splice(inputIndex, removeN);
    this.itemFields.splice(inputIndex, removeN);
    this.itemValues.splice(inputIndex, removeN);
    if (this.totalInputs.length === 0) {
      this.AddInput({ field: '', value: '', suspendSubject: false });
    }
  }

  checkForContent() {
    let hasField = false;
    let hasValue = false;
    this.totalInputs.forEach((inputValue) => {
      hasField = this.itemFields[inputValue] !== '' ? true : hasField;
      hasValue = this.itemValues[inputValue] !== '' ? true : hasValue;
    });
    return hasField || hasValue;
  }

  AddInput(initObject: { field: string; value: any; suspendSubject: boolean }) {
    if (this.totalInputs.length < this.MAX_INPUTS) {
      const inputLength = this.totalInputs.length;
      // to keep track of the indices of the input elements
      this.totalInputs.push(inputLength);
      this.itemFields[inputLength] = initObject.field ? initObject.field : '';
      this.itemValues[inputLength] = initObject.value ? initObject.value : '';
      if (!initObject.suspendSubject) {
        this.inputAdded.next(inputLength);
      }
    } // else pop up to tell user no
  }

  loadItem(fields, values, longFieldIndex) {
    const inputLength =
      fields.length > values.length ? fields.length : values.length;
    for (let i = 0; i < inputLength; i++) {
      if (i < inputLength - 1) {
        // when loading item don't need to emit event for cursor change
        this.AddInput({ field: '', value: '', suspendSubject: true }); // we start with already having 1 input
      }
      this.itemFields[i] = fields[i];
      this.itemValues[i] = values[i];
    }
    if (longFieldIndex > -1) {
      this.setLongFieldIndex(longFieldIndex);
    } else {
      this.setLongFieldIndex(-1);
    }
  }

  getLongFieldIndex() {
    return this.longFieldIndex;
  }

  setLongFieldIndex(index) {
    this.longFieldIndex = index;
    this.longFieldSubject.next(this.longFieldIndex);
  }
}
