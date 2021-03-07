import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-item-input',
  templateUrl: './item-input.component.html',
  styleUrls: ['./item-input.component.css'],
})
export class ItemInputComponent implements OnInit, OnDestroy {
  @Input() editMode: boolean = false;
  addingTemplate: boolean;
  totalInputs: number[];
  longField: boolean = false;
  longFieldIndex: number;
  longFieldSub: Subscription;

  constructor(private itemManager: ItemManagementService) {}

  ngOnInit(): void {
    this.totalInputs = this.itemManager.totalInputs;
    this.longFieldIndex = this.itemManager.getLongFieldIndex();
    this.longFieldSub = this.itemManager.longFieldSubject.subscribe((index) => {
      this.longFieldIndex = index;
    });
  }

  onClearItem(index) {
    this.itemManager.removeInput(index);
  }

  onLongClick(index) {
    this.longField = !this.longField;
    if (this.longField) {
      this.itemManager.setLongFieldIndex(index);
    } else {
      this.itemManager.setLongFieldIndex(-1);
    }
  }

  ngOnDestroy(): void {
    this.longFieldSub.unsubscribe();
  }
}
