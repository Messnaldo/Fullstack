import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestHistory } from './test-history.entity';

@Injectable()
export class TestHistoryService {
  constructor(
    @InjectRepository(TestHistory)
    private testHistoryRepository: Repository<TestHistory>,
  ) {}

  async create(text: string, label: number): Promise<TestHistory> {
    const newHistory = this.testHistoryRepository.create({ text, label });
    return this.testHistoryRepository.save(newHistory);
  }
}
