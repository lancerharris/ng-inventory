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
  MAX_VALUE_LENGTH: number = 80;
  private longFieldIndex: number = -1;
  public longFieldSubject = new Subject<number>();
  public inputAdded = new Subject<number>();

  constructor() {}

  removeInputs(inputIndex, removeN = 1) {
    this.totalInputs.splice(inputIndex, removeN);
    this.itemFields.splice(inputIndex, removeN);
    this.itemValues.splice(inputIndex, removeN);
    if (this.totalInputs.length === 0) {
      this.AddInput();
    }
  }

  AddInput() {
    if (this.totalInputs.length < this.MAX_INPUTS) {
      // to keep track of the indices of the input elements
      this.totalInputs.push(this.totalInputs.length);
      this.inputAdded.next(this.totalInputs.length - 1);
    } // else pop up to tell user no
  }

  getLongFieldIndex() {
    return this.longFieldIndex;
  }

  setLongFieldIndex(index) {
    this.longFieldIndex = index;
    this.longFieldSubject.next(this.longFieldIndex);
  }
}
