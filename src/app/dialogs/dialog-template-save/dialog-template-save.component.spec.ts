import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTemplateSaveComponent } from './dialog-template-save.component';

describe('DialogTemplateSaveComponent', () => {
  let component: DialogTemplateSaveComponent;
  let fixture: ComponentFixture<DialogTemplateSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTemplateSaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTemplateSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
