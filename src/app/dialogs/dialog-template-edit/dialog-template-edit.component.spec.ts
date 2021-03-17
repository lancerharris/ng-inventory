import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTemplateEditComponent } from './dialog-template-edit.component';

describe('DialogTemplateEditComponent', () => {
  let component: DialogTemplateEditComponent;
  let fixture: ComponentFixture<DialogTemplateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTemplateEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTemplateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
