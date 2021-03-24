import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCell, MatTableDataSource } from '@angular/material/table';
import { ItemCrudService } from '../item-crud.service';
import { fromEvent, Subscription } from 'rxjs';
import { ITS_JUST_ANGULAR } from '@angular/core/src/r3_symbols';
import { TableManagementService } from '../table-management.service';

@Component({
  selector: 'app-all-items',
  templateUrl: './all-items.component.html',
  styleUrls: ['./all-items.component.css'],
})
export class AllItemsComponent implements OnInit, OnDestroy {
  public value: string = '';
  public displayedColumns: string[];
  public headerRow: string[];
  public dataSource: MatTableDataSource<any>;
  public changesMade: boolean = false;
  private cells: HTMLInputElement[] = [];

  private itemsSub: Subscription;
  private itemChangesSub: Subscription;

  @ViewChild(MatCell) cell: MatCell;

  selection = new SelectionModel<any>(true, []);

  constructor(
    private itemCrudService: ItemCrudService,
    private tableManagmentService: TableManagementService
  ) {}

  ngOnInit() {
    if (!this.itemCrudService.localItems) {
      this.itemCrudService.getItems(false);
    } else {
      this.dataSource = new MatTableDataSource<any>(
        this.itemCrudService.localTableItems
      );
      this.displayedColumns = this.itemCrudService.localTableFields.filter(
        (field) => field !== '_id'
      );
      this.headerRow = ['select', ...this.displayedColumns];
    }
    this.itemsSub = this.itemCrudService.localItemsSubject.subscribe(() => {
      this.dataSource = new MatTableDataSource<any>(
        this.itemCrudService.localTableItems
      );
      this.displayedColumns = this.itemCrudService.localTableFields.filter(
        (field) => field !== '_id'
      );
      this.headerRow = ['select', ...this.displayedColumns];
    });
    this.itemChangesSub = this.tableManagmentService.localItemChangesSubject.subscribe(
      () => {
        const itemChangeCount = Object.keys(
          this.tableManagmentService.localItemChanges
        ).length;
        this.changesMade = itemChangeCount > 0 ? true : false;
      }
    );
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  onDropChanges() {
    const localTableItems = this.itemCrudService.localTableItems;
    Object.keys(this.tableManagmentService.localItemChanges).forEach((item) => {
      const changedItemIndex = localTableItems.findIndex((el) => {
        return el['_id'] === item;
      });

      // for now this should be the same as changedItemIndex
      const rowIndex = localTableItems[changedItemIndex]['rowIndex'];

      Object.keys(this.tableManagmentService.localItemChanges[item]).forEach(
        (field) => {
          const cellElement = document.getElementById(
            field + '_' + rowIndex
          ) as HTMLTableCellElement;
          cellElement.innerText = localTableItems[changedItemIndex][field];
          cellElement.classList.remove('cell__edited');
        }
      );
    });
    this.tableManagmentService.localItemChanges = {};
  }

  onSaveChanges() {}

  onRowEdit(row) {
    console.log(row);
  }

  onCellEdit(event) {
    console.log(event);
    // this.itemCrudService.localTableItems.forEach((item) => {
    //   this.itemCrudService.localTableFields.forEach((field) => {
    //     this.cells.push(
    //       document.getElementById(
    //         field + '_' + item.rowIndex
    //       ) as HTMLInputElement
    //     );
    //   });
    // });
    // console.log(this.cells);

    // console.log(event.srcElement.innerText);
    // console.log(element);
    // if (event !== initialValue) {
    //   event.target.classList.add('cell__edited');
    //   this.changesMade = true;
    // }
  }

  ngOnDestroy() {
    this.itemsSub.unsubscribe();
  }
}
