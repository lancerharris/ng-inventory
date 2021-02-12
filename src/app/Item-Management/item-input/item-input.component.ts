import { Component, Input, OnInit } from '@angular/core';
import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-item-input',
  templateUrl: './item-input.component.html',
  styleUrls: ['./item-input.component.css']
})
export class ItemInputComponent implements OnInit {
  @Input() inputIndex: number;
  addingTemplate: boolean;
  totalInputs: number[];

  constructor(private itemManager: ItemManagementService) { }

  ngOnInit(): void {
    this.totalInputs = this.itemManager.totalInputs
  }

  onClearItem() {
    this.itemManager.removeInput(this.inputIndex);
  }

}
