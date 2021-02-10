import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {
  totalInputs: number[];
  templates: string[] = ["Tops", "Dresses", "Bottoms"]

  constructor(private itemManager: ItemManagementService) { }

  ngOnInit(): void {
    this.totalInputs = this.itemManager.totalInputs
  }

  onAdd() {
    const currentLength = this.totalInputs.length
    if (currentLength <= 19) {
      // to keep track of the indices of the input elements
      this.totalInputs.push(currentLength);
    }
    // else pop up to tell user no
  }

}
