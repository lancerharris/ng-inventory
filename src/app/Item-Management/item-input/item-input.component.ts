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
  longFieldSub: Subscription;
  longFieldValue: string;
  private newInputAdded: boolean;

  constructor(private itemManager: ItemManagementService) {}

  ngOnInit(): void {
    this.totalInputs = this.itemManager.totalInputs;
    this.longFieldIndex = this.itemManager.getLongFieldIndex();
    this.longFieldSub = this.itemManager.longFieldSubject.subscribe((index) => {
      this.longFieldIndex = index;
    });
  }

  onClearItem(index) {
    if (index === this.longFieldIndex) {
      this.onLongClick(index);
    }
    this.itemManager.removeInputs(index, 1);
  }

  onLongClick(index) {
    this.longFieldValue = (document.getElementById(
      'value_' + index
    ) as HTMLInputElement).value;
    this.longField = !this.longField;
    if (this.longField) {
      this.itemManager.setLongFieldIndex(index);
    } else {
      this.itemManager.setLongFieldIndex(-1);
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
        if (i !== this.itemManager.MAX_INPUTS - 1) {
          this.itemManager.AddInput();
          this.newInputAdded = true;
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
      ) as HTMLInputElement).value = this.longFieldValue;
      this.priorLongFieldIndex = null;
    }

    if (this.newInputAdded) {
      document
        .getElementById('field_' + (this.itemManager.totalInputs.length - 1))
        .focus();
      this.newInputAdded = false;
    }
  }

  ngOnDestroy(): void {
    this.longFieldSub.unsubscribe();
  }
}
