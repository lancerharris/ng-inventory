import { Component, Input, OnInit } from '@angular/core';
import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-item-input',
  templateUrl: './item-input.component.html',
  styleUrls: ['./item-input.component.css']
})
export class ItemInputComponent implements OnInit {
  @Input() inputIndex: number = 1;

  constructor(private itemManager: ItemManagementService) { }

  ngOnInit(): void {
  }

  onClearItem() {
    this.itemManager.removeInput(this.inputIndex);
    console.log(this.inputIndex)
  }

}
