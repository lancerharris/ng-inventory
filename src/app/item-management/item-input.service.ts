import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemInputService {
  itemFields: string[] = [];
  itemValues: string[] = [];
  totalInputs: number[] = [0];
  MAX_INPUTS: number = 20;
  private longFieldIndex: number;
  longFieldSubject = new Subject<number>();
  inputAdded = new Subject<number>();

  constructor() {}

  removeInputs(inputIndex, removeN = 1) {
    this.itemFields.splice(inputIndex, removeN);
    this.itemValues.splice(inputIndex, removeN);
    this.totalInputs.splice(inputIndex, removeN);
  }

  AddInput() {
    if (this.totalInputs.length <= this.MAX_INPUTS - 1) {
      // to keep track of the indices of the input elements
      this.totalInputs.push(this.totalInputs.length);
      this.inputAdded.next(this.totalInputs.length - 1);
    } // else pop up to tell user no
  }

  getLongFieldIndex() {
    if (!this.longFieldIndex) {
      return -1;
    }
    return this.longFieldIndex;
  }

  setLongFieldIndex(index) {
    this.longFieldIndex = index;
    this.longFieldSubject.next(this.longFieldIndex);
  }
}
