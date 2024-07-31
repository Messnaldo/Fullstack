import { Test, TestingModule } from '@nestjs/testing';
import { TestHistoryService } from './test-history.service';

describe('TestHistoryService', () => {
  let service: TestHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestHistoryService],
    }).compile();

    service = module.get<TestHistoryService>(TestHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
