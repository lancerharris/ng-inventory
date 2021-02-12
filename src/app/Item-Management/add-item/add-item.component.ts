import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {
  totalInputs: number[];
  templates: string[] = ["Tops", "Dresses", "Bottoms"]
  addingTemplate: boolean;

  constructor(private itemManager: ItemManagementService, private router: Router) { }

  ngOnInit(): void {
    this.totalInputs = this.itemManager.totalInputs
    this.addingTemplate = this.router.url === '/items/add-template';
    this.itemManager.addingTemplate = this.addingTemplate
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
