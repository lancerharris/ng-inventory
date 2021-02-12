import { Component, Input, OnInit } from '@angular/core';
import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-item-input',
  templateUrl: './item-input.component.html',
  styleUrls: ['./item-input.component.css']
})
export class ItemInputComponent implements OnInit {
  @Input() inputIndex: number;
  @Input() templateName: string;
  @Input() nameLength: number;
  addingTemplate: boolean;

  constructor(private itemManager: ItemManagementService) { }

  ngOnInit(): void {
    this.addingTemplate = this.itemManager.addingTemplate
  }

  onClearItem() {
    this.itemManager.removeInput(this.inputIndex);
  }

}
