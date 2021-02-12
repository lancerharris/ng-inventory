import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {
  
  templates: string[] = ["Tops", "Dresses", "Bottoms"]
  addingTemplate: boolean;
  value: string = '';

  constructor(private itemManager: ItemManagementService, private router: Router) { }

  ngOnInit(): void {
    this.addingTemplate = this.router.url === '/items/add-template';
  }

  onAdd() {
    const currentLength = this.itemManager.totalInputs.length
    if (currentLength <= 19) {
      // to keep track of the indices of the input elements
      this.itemManager.totalInputs.push(currentLength);
    }
    // else pop up to tell user no
  }

}
