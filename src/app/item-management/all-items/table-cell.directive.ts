import { Directive, ElementRef, HostListener } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { ItemCrudService } from '../item-crud.service';
import { TableManagementService } from '../table-management.service';

@Directive({
  selector: '[appTableCell]',
})
export class TableCellDirective {
  private typeahead: Observable<{
    text: string;
    field: string;
    rowIndex: string;
  }>;

  constructor(
    private el: ElementRef,
    private itemCrudService: ItemCrudService,
    private tableManagmentService: TableManagementService
  ) {
    this.typeahead = fromEvent(this.el.nativeElement, 'input').pipe(
      map((e: InputEvent) => {
        const idSplit = (e.target as HTMLTableCellElement).id.split('_');
        return {
          text: (e.target as HTMLTableCellElement).innerText,
          field: idSplit[0],
          rowIndex: idSplit[1],
        };
      }),
      debounceTime(50),
      distinctUntilChanged((curr, prev) => curr.text === prev.text)
    );

    this.typeahead.subscribe((ev) => {
      const currTableItem = this.itemCrudService.localTableItems[ev.rowIndex];

      if (ev.text !== currTableItem[ev.field]) {
        this.el.nativeElement.classList.add('cell__edited');
      }

      const itemId = currTableItem['_id'];
      const localItem = this.tableManagmentService.localItemChanges[itemId];
      if (!localItem) {
        this.tableManagmentService.localItemChanges[itemId] = {};
      }
      // remove a change if reverted to starting value.
      if (ev.text === currTableItem[ev.field] && localItem[ev.field]) {
        delete localItem[ev.field];
        if (Object.keys(localItem).length === 0) {
          delete this.tableManagmentService.localItemChanges[itemId];
        }
      } else {
        this.tableManagmentService.localItemChanges[itemId][ev.field] = ev.text;
      }
      this.tableManagmentService.localItemChangesSubject.next();

      // todo: reach out to itemCrudService to load the changed element. later will be used to replace coinciding documents
    });
  }
}
