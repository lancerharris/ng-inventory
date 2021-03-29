import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReviewItemsService } from '../review-items.service';

@Directive({
  selector: '[appInputEdit]',
})
export class InputEditDirective {
  @Input() reviewMode: boolean;
  @Input() fieldOrValue: string;
  @Input() rowIndex: number;

  @Output() cellEditedChange = new EventEmitter<boolean>();

  private typeaheadSubject: BehaviorSubject<{
    text: string;
    fieldOrValue: string;
    rowIndex: number;
  }>;

  private listnerInitialized: boolean = false;

  constructor(
    private el: ElementRef,
    private reviewItemsService: ReviewItemsService
  ) {}

  @HostListener('input', ['$event.target']) onInput(eventTarget) {
    const eventObject = {
      text: eventTarget.value,
      fieldOrValue: this.fieldOrValue,
      rowIndex: this.rowIndex,
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

    this.typeaheadSubject.subscribe(() => {
      const currItem = this.reviewItemsService.currItem;
      const currItemKey =
        eventObject.fieldOrValue === 'field' ? 'fields' : 'values';
      if (eventObject.text !== currItem[currItemKey][eventObject.rowIndex]) {
        this.cellEditedChange.emit(true);
      } else {
        this.cellEditedChange.emit(false);
      }
    });
  }
}
