import { TestBed } from '@angular/core/testing';

import { PpfService } from './ppf.service';

describe('PpfService', () => {
  let service: PpfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
