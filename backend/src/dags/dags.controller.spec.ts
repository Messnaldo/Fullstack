import { Test, TestingModule } from '@nestjs/testing';
import { DagsController } from './dags.controller';

describe('DagsController', () => {
  let controller: DagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DagsController],
    }).compile();

    controller = module.get<DagsController>(DagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
