import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReviewItemsService } from '../review-items.service';

@Directive({
  selector: '[appInputEdit]',
})
export class InputEditDirective {
  @Input() reviewMode: boolean;

  private typeaheadSubject: BehaviorSubject<{
    text: string;
    fieldOrValue: string;
    rowIndex: string;
  }>;

  private listnerInitialized: boolean = false;

  constructor(
    private el: ElementRef,
    private reviewItemsService: ReviewItemsService
  ) {}

  @HostListener('input') onInput() {
    const idSplit = (this.el.nativeElement as HTMLInputElement).id.split('_');
    const eventObject = {
      text: (this.el.nativeElement as HTMLInputElement).value,
      fieldOrValue: idSplit[0],
      rowIndex: idSplit[1],
    };

    if (this.reviewMode) {
      if (!this.listnerInitialized) {
        this.typeaheadSubject = new BehaviorSubject(eventObject);
        this.typeaheadSubject.pipe(
          debounceTime(50),
          distinctUntilChanged((curr, prev) => curr.text === prev.text)
        );
      }
      this.typeaheadSubject.next(eventObject);
      this.listnerInitialized = true;
    }

    this.typeaheadSubject.subscribe((ev) => {
      const currItem = this.reviewItemsService.currItem;
      const currItemKey =
        eventObject.fieldOrValue === 'field' ? 'fields' : 'values';
      if (eventObject.text !== currItem[currItemKey][eventObject.rowIndex]) {
        this.el.nativeElement.classList.add('cell__edited');
      } else {
        this.el.nativeElement.classList.remove('cell__edited');
      }
    });
  }
}
