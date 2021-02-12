import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemManagementService {
  totalInputs: [number] = [0];
  addingTemplate: boolean = false;
  constructor() { }

  removeInput(inputIndex) {
    this.totalInputs.splice(inputIndex, 1);
  }
}
