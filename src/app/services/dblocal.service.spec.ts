import { TestBed } from '@angular/core/testing';

import { DblocalService } from './dblocal.service';

describe('DblocalService', () => {
  let service: DblocalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DblocalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
