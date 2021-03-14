import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarSimpleMessageComponent } from './snackbar-simple-message.component';

describe('SnackbarSimpleMessageComponent', () => {
  let component: SnackbarSimpleMessageComponent;
  let fixture: ComponentFixture<SnackbarSimpleMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnackbarSimpleMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarSimpleMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
