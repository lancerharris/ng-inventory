import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { ItemCrudService } from '../item-crud.service';
import { ReviewItemsService } from '../review-items.service';
import { TableManagementService } from '../table-management.service';

@Directive({
  selector: '[appInputEdit]',
})
export class InputEditDirective {
  @Input() reviewMode: boolean;

  private typeahead: Observable<{
    text: string;
    fieldOrValue: string;
    rowIndex: string;
  }>;
  private temp: string;
  constructor(
    private el: ElementRef,
    private reviewItemsService: ReviewItemsService
  ) {}

  @HostListener('input') onInput() {
    this.setUpListener();
  }

  setUpListener() {
    console.log('hello der');
    console.log(this.reviewMode);
    if (this.reviewMode) {
      this.temp = 'hello';
      this.typeahead = fromEvent(this.el.nativeElement, 'input').pipe(
        tap((e) => console.log(e)),
        map((e: InputEvent) => {
          const idSplit = (e.target as HTMLInputElement).id.split('_');
          return {
            text: (e.target as HTMLInputElement).value,
            fieldOrValue: idSplit[0],
            rowIndex: idSplit[1],
          };
        }),
        debounceTime(50),
        distinctUntilChanged((curr, prev) => curr.text === prev.text)
      );

      this.typeahead.subscribe((ev) => {
        console.log('ev in sub');
        console.log(ev);
        const currItem = this.reviewItemsService.currItem;
        const currItemKey = ev.fieldOrValue === 'field' ? 'fields' : 'values';

        if (ev.text !== currItem[currItemKey][ev.rowIndex]) {
          this.el.nativeElement.classList.add('cell__edited');
        }
      });
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    console.log(this.reviewMode);
    console.log(this.temp);
  }
}
