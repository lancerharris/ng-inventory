import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ItemInputService {
  itemFields: string[] = [];
  itemValues: string[] = [];

  constructor() {}

  removeInputs(inputIndex, removeN = 1) {
    this.itemFields.splice(inputIndex, removeN);
    this.itemValues.splice(inputIndex, removeN);
  }
}
