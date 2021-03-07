import {
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { Subscription } from 'rxjs';
import { ItemInputService } from '../item-input.service';
import { ItemManagementService } from '../item-management.service';

@Component({
  selector: 'app-item-input',
  templateUrl: './item-input.component.html',
  styleUrls: ['./item-input.component.css'],
})
export class ItemInputComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() editMode: boolean = false;

  addingTemplate: boolean;
  totalInputs: number[];
  longField: boolean = false;
  priorLongFieldIndex: number;
  longFieldIndex: number;
  longFieldValue: string;
  private newInputAdded: boolean;
  longFieldSub: Subscription;
  inputAddedSub: Subscription;
  itemFields: string[];
  itemValues: string[];

  constructor(
    private itemManager: ItemManagementService,
    private itemInputService: ItemInputService
  ) {}

  ngOnInit(): void {
    this.itemFields = this.itemInputService.itemFields;
    this.itemValues = this.itemInputService.itemValues;
    this.totalInputs = this.itemInputService.totalInputs;
    this.longFieldIndex = this.itemInputService.getLongFieldIndex();
    this.longFieldSub = this.itemInputService.longFieldSubject.subscribe(
      (index) => {
        this.longFieldIndex = index;
      }
    );
    this.inputAddedSub = this.itemInputService.inputAdded.subscribe(
      (addedIndex) => {
        this.newInputAdded = true;
        console.log(this.itemFields);
      }
    );
  }

  onClearItem(index) {
    if (index === this.longFieldIndex) {
      this.onLongClick(index);
    }
    this.itemInputService.removeInputs(index, 1);
  }

  onLongClick(index) {
    this.longFieldValue = (document.getElementById(
      'value_' + index
    ) as HTMLInputElement).value;
    this.longField = !this.longField;
    if (this.longField) {
      this.itemInputService.setLongFieldIndex(index);
    } else {
      this.itemInputService.setLongFieldIndex(-1);
      this.priorLongFieldIndex = index;
    }
  }

  autoGrow(event) {
    event.target.style.height = event.target.scrollHeight + 'px';
    // element.style.height = element.scrollHeight + 'px';
  }

  onInputEnterKey(startIndex, inputStatus) {
    for (let i = startIndex; i < this.totalInputs.length; i++) {
      inputStatus = inputStatus === 'field_' ? 'value_' : 'field_';
      if (i === this.totalInputs.length - 1 && inputStatus === 'field_') {
        if (i !== this.itemInputService.MAX_INPUTS - 1) {
          this.itemInputService.AddInput();
          // this.newInputAdded = true;
        }
        return;
      }
      i = inputStatus === 'field_' ? i + 1 : i;
      if (
        (document.getElementById(inputStatus + i) as HTMLInputElement).value ===
        ''
      ) {
        document.getElementById(inputStatus + i).focus();
        return;
      }
      i -= 1; // to avoid skipping value field at the next i level on iteration
    }
  }

  onInputUpDown(eventKey: string, startIndex: number, inputStatus: string) {
    const direction: number = eventKey === 'ArrowUp' ? -1 : 1;
    if (startIndex > 0 && direction < 0) {
      document.getElementById(inputStatus + (startIndex + direction)).focus();
    } else if (startIndex < this.totalInputs.length - 1 && direction > 0) {
      document.getElementById(inputStatus + (startIndex + direction)).focus();
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
      document
        .getElementById(nextInputStatus + (startIndex + rowOffset))
        .focus();
    } else if (columnOffset < 0) {
      if (inputStatus === 'field_' && startIndex === 0) {
        startIndex = this.totalInputs.length;
      }
      document
        .getElementById(nextInputStatus + (startIndex + rowOffset - 1))
        .focus();
    }
  }

  onInputKeydown(event, startIndex, inputStatus) {
    inputStatus = inputStatus === 'inField' ? 'field_' : 'value_';
    if (event.key === 'Enter') {
      this.onInputEnterKey(startIndex, inputStatus);
    } else if (
      event.ctrlKey &&
      (event.key === 'ArrowUp' || event.key === 'ArrowDown')
    ) {
      this.onInputUpDown(event.key, startIndex, inputStatus);
    } else if (
      event.ctrlKey &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    ) {
      this.onInputLeftRight(event.key, startIndex, inputStatus);
    }
  }

  ngAfterViewChecked(): void {
    if (this.priorLongFieldIndex > -1) {
      (document.getElementById(
        'value_' + this.priorLongFieldIndex
      ) as HTMLInputElement).value = this.longFieldValue.substring(
        0,
        this.itemInputService.MAX_VALUE_LENGTH
      );
      this.priorLongFieldIndex = -1;
    }

    if (this.itemInputService.totalInputs.length < 1) {
      this.itemInputService.AddInput();
    }

    if (this.newInputAdded) {
      document
        .getElementById(
          'field_' + (this.itemInputService.totalInputs.length - 1)
        )
        .focus();
      this.newInputAdded = false;
    }
  }

  ngOnDestroy(): void {
    this.longFieldSub.unsubscribe();
    this.inputAddedSub.unsubscribe();
  }
}
