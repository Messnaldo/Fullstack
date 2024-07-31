import { Module } from '@nestjs/common';
import { DagsController } from './dags.controller';
import { DagsService } from './dags.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dag } from './dag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dag])],
  controllers: [DagsController],
  providers: [DagsService]
})
export class DagsModule {}
