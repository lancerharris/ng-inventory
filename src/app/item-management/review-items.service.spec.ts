import { TestBed } from '@angular/core/testing';

import { ReviewItemsService } from './review-items.service';

describe('ReviewItemsService', () => {
  let service: ReviewItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
