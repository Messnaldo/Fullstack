import { Test, TestingModule } from '@nestjs/testing';
import { DagsService } from './dags.service';

describe('DagsService', () => {
  let service: DagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DagsService],
    }).compile();

    service = module.get<DagsService>(DagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
