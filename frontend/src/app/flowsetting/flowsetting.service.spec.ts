import { TestBed } from '@angular/core/testing';

import { FlowsettingService } from './flowsetting.service';

describe('FlowsettingService', () => {
  let service: FlowsettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlowsettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
