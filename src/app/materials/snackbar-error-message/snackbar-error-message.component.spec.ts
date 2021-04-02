import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarErrorMessageComponent } from './snackbar-error-message.component';

describe('SnackbarErrorMessageComponent', () => {
  let component: SnackbarErrorMessageComponent;
  let fixture: ComponentFixture<SnackbarErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnackbarErrorMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
