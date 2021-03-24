import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ItemCrudService } from './item-crud.service';

@Injectable({
  providedIn: 'root',
})
export class TableManagementService {
  public localItemChanges = {};

  public localItemChangesSubject = new Subject<void>();

  constructor(private itemCrudService: ItemCrudService) {}
}
