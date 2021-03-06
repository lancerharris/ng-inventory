import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { Subscription } from 'rxjs';
import { ItemInputService } from '../item-input.service';
import { ReviewItemsService } from '../review-items.service';

@Component({
  selector: 'app-item-input',
  templateUrl: './item-input.component.html',
  styleUrls: ['./item-input.component.css'],
})
export class ItemInputComponent implements OnInit, OnDestroy {
  @Input() editMode: boolean = false;
  @Input() reviewMode: boolean = false;

  @Output() cellEdited = new EventEmitter<boolean>();

  public itemFields: string[];
  public itemValues: string[];
  public editedInputs: { fieldsEdited: boolean[]; valuesEdited: boolean[] };
  public totalInputs: number[];
  public longField: boolean = false;
  public longFieldIndex: number = -1;
  private itemSelectSub: Subscription;
  private longFieldSub: Subscription;
  private inputAddedSub: Subscription;

  constructor(
    private itemInputService: ItemInputService,
    private reviewItemService: ReviewItemsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.itemFields = this.itemInputService.itemFields;
    this.itemValues = this.itemInputService.itemValues;
    this.totalInputs = this.itemInputService.totalInputs;
    this.editedInputs = this.reviewItemService.editedInputs;
    // this is needed for showing the long edit button in the view
    this.longFieldSub = this.itemInputService.longFieldSubject.subscribe(
      (index) => {
        this.longFieldIndex = index;
      }
    );
    this.inputAddedSub = this.itemInputService.inputAdded.subscribe(
      (addedIndex) => {
        this.cd.detectChanges(); // allow the app to know of the existence of new element
        document.getElementById('field_' + addedIndex).focus();
      }
    );
    this.itemSelectSub = this.itemInputService.itemSelectedSubject.subscribe(
      () => {
        this.selectFirstEmptyInput();
      }
    );
  }

  changeCellEditedStatus(
    cellEdited: boolean,
    fieldOrValue: string,
    index: number
  ) {
    if (cellEdited) {
      // to enable drop changes button
      this.cellEdited.emit(cellEdited);
    }
    fieldOrValue =
      fieldOrValue === 'field'
        ? 'fieldsEdited'
        : fieldOrValue === 'value'
        ? 'valuesEdited'
        : 'err';
    this.editedInputs[fieldOrValue][index] = cellEdited;
  }

  selectFirstEmptyInput() {
    this.cd.detectChanges();
    // if all fields and values full, select first value field
    const fieldsLength = this.itemInputService.itemFields.length;
    const valuesLength = this.itemInputService.itemValues.length;

    const emptyField = this.itemInputService.itemFields.findIndex(
      (el) => el === ''
    );
    const emptyValue = this.itemInputService.itemValues.findIndex(
      (el) => el === ''
    );
    if (fieldsLength === 0 && valuesLength === 0) {
      document.getElementById('field_0').focus();
    } else if (emptyField !== -1 || emptyValue !== -1) {
      document.getElementById('field_0').focus();
      if (emptyField !== 0) {
        this.onInputEnterKey(0, 'field_');
      }
    } else {
      (document.getElementById('value_0') as HTMLInputElement).focus();
    }
  }

  onClearItem(index) {
    if (index === this.itemInputService.getLongFieldIndex()) {
      this.itemInputService.setLongFieldIndex(-1);
    }
    this.itemInputService.removeInputs(index, 1);
  }

  onLongClick(index) {
    const longFieldIndex = this.itemInputService.getLongFieldIndex();
    const value = this.itemInputService.itemValues[index] || '';
    if (longFieldIndex > -1) {
      this.itemInputService.itemValues[index] = value
        .substring(0, this.itemInputService.MAX_VALUE_LENGTH)
        .trim();
      this.itemInputService.setLongFieldIndex(-1);
    } else {
      this.itemInputService.itemValues[index] = value.trim();
      this.itemInputService.setLongFieldIndex(index);
    }
  }

  autoGrow(event) {
    event.target.style.height = event.target.scrollHeight + 'px';
  }

  onInputEnterKey(startIndex, inputStatus) {
    let firstEmptyIndex;
    let targetStatus;
    if (
      inputStatus === 'field_' &&
      !this.itemInputService.itemValues[startIndex]
    ) {
      targetStatus = 'value_';
      firstEmptyIndex = startIndex;
    } else if (startIndex < this.totalInputs.length - 1) {
      for (let i = startIndex + 1; i < this.totalInputs.length; i++) {
        if (
          !this.itemInputService.itemFields[i] ||
          !this.itemInputService.itemValues[i]
        ) {
          firstEmptyIndex = i;
          targetStatus = !this.itemInputService.itemFields[firstEmptyIndex]
            ? 'field_'
            : 'value_';
          break;
        }
      }
      if (!firstEmptyIndex) {
        this.itemInputService.AddInput({
          field: '',
          value: '',
          suspendSubject: false,
        });
      }
    } else {
      targetStatus = 'field_';
      firstEmptyIndex = startIndex + 1;
      this.itemInputService.AddInput({
        field: '',
        value: '',
        suspendSubject: false,
      });
      return; // must return, getElementById won't work since the input isn't available yet.
    }

    if (firstEmptyIndex >= 0) {
      document.getElementById(targetStatus + firstEmptyIndex).focus();
    }
  }

  onInputUpDown(eventKey: string, startIndex: number, inputStatus: string) {
    const direction: number = eventKey === 'ArrowUp' ? -1 : 1;
    if (startIndex === 0 && direction < 0) {
      document
        .getElementById(inputStatus + (this.totalInputs.length - 1))
        .focus();
    } else if (startIndex > 0 && direction < 0) {
      document.getElementById(inputStatus + (startIndex + direction)).focus();
    } else if (startIndex < this.totalInputs.length - 1 && direction > 0) {
      document.getElementById(inputStatus + (startIndex + direction)).focus();
    } else if (startIndex === this.totalInputs.length - 1 && direction > 0) {
      document.getElementById(inputStatus + 0).focus();
    }
  }

  onInputLeftRight(eventKey: string, startIndex, inputStatus) {
    const columnOffset: number = eventKey === 'ArrowRight' ? 1 : -1;
    let nextInputStatus = inputStatus === 'field_' ? 'value_' : 'field_';
    const rowOffset = inputStatus === 'field_' ? 0 : 1;
    if (columnOffset > 0) {
      if (
        inputStatus === 'value_' &&
        startIndex === this.totalInputs.length - 1
      ) {
        startIndex = -1;
      }

      const input = <HTMLInputElement>(
        document.getElementById(nextInputStatus + (startIndex + rowOffset))
      );
      input.focus();
    } else if (columnOffset < 0) {
      if (inputStatus === 'field_' && startIndex === 0) {
        startIndex = this.totalInputs.length;
      }
      const input = <HTMLInputElement>(
        document.getElementById(nextInputStatus + (startIndex + rowOffset - 1))
      );
      input.focus();
    }
  }

  onInputKeydown(event, startIndex, inputStatus) {
    // event.preventDefault();

    inputStatus = inputStatus === 'inField' ? 'field_' : 'value_';

    if (event.key === 'Enter' && !event.shiftKey) {
      this.onInputEnterKey(startIndex, inputStatus);
    } else if (
      event.ctrlKey &&
      event.altKey &&
      (event.key === 'ArrowUp' || event.key === 'ArrowDown')
    ) {
      this.onInputUpDown(event.key, startIndex, inputStatus);
    } else if (
      event.ctrlKey &&
      event.altKey &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    ) {
      this.onInputLeftRight(event.key, startIndex, inputStatus);
    }
  }

  ngOnDestroy(): void {
    this.longFieldSub.unsubscribe();
    this.inputAddedSub.unsubscribe();
    this.itemSelectSub.unsubscribe();
  }
}
