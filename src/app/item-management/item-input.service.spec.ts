import { TestBed } from '@angular/core/testing';

import { ItemInputService } from './item-input.service';

describe('ItemInputService', () => {
  let service: ItemInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
