import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogActionCancelComponent } from './dialog-action-cancel.component';

describe('DialogComponent', () => {
  let component: DialogActionCancelComponent;
  let fixture: ComponentFixture<DialogActionCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogActionCancelComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogActionCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
