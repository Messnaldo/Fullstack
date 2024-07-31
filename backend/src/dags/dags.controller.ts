import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { DagsService } from './dags.service';
import { CreateDagDto } from './create-dag.dto';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('dags')
@Controller('dags')
export class DagsController {
  constructor(private readonly dagsService: DagsService) {}
  @ApiOperation({ summary: 'Get all DAGs' })
  @ApiResponse({ status: 200, description: 'DAGs retrieved successfully.' })
  @Get()
  async getDags() {
    const dags = await this.dagsService.getDags();
    return JSON.parse(JSON.stringify(dags));
  }
  @ApiOperation({ summary: 'Create a new DAG' })
  @ApiBody({ type: CreateDagDto })
  @ApiResponse({ status: 201, description: 'DAG created successfully.' })
  @Post('create')
  async createDag(@Body() createDagDto: CreateDagDto) {
    return this.dagsService.create(createDagDto);
  }
  @ApiOperation({ summary: 'Pause or unpause all DAGs' })
  @ApiBody({ schema: { type: 'object', properties: { is_paused: { type: 'boolean' } } } })
  @ApiResponse({ status: 200, description: 'All DAGs paused or unpaused successfully.' })
  @Patch('pause-all')
  async setIsPaused(@Body('is_paused') isPaused: boolean) {
    return this.dagsService.setIsPaused(isPaused);
  }
  @ApiOperation({ summary: 'Update a specific DAG' })
  @ApiParam({ name: 'dagId', description: 'ID of the DAG to update' })
  @ApiBody({ type: CreateDagDto })
  @ApiResponse({ status: 200, description: 'DAG updated successfully.' })
  @Patch(':dagId')
  async updateDag(@Param('dagId') dagId: string, @Body() dagConfig: CreateDagDto) {
    return this.dagsService.updateDag(dagId, dagConfig);
  }

  // @Delete(':dagId')
  @ApiOperation({ summary: 'Delete a specific DAG' })
  @ApiParam({ name: 'dagId', description: 'ID of the DAG to delete' })
  @ApiResponse({ status: 200, description: 'DAG deleted successfully.' })
  @Delete(':dagId')
  async deleteDag(@Param('dagId') dagId: string) {
    return this.dagsService.deleteDag(dagId);
  }
  @ApiOperation({ summary: 'Run a specific DAG' })
  @ApiParam({ name: 'dagId', description: 'ID of the DAG to run' })
  @ApiResponse({ status: 200, description: 'DAG run successfully.' })
  @Post(':dagId/run')
  async runDag(@Param('dagId') dagId: string) {
    return this.dagsService.runDag(dagId);
  }
@ApiOperation({ summary: 'Get all DAGs (alternative endpoint)' })
@ApiResponse({ status: 200, description: 'All DAGs retrieved successfully.' })
@Get('all')
  getAllDags() {
    return this.dagsService.findAll();
  }
  @ApiOperation({ summary: 'Stop a specific DAG run' })
  @ApiParam({ name: 'dagId', description: 'ID of the DAG' })
  @ApiParam({ name: 'dagRunId', description: 'ID of the DAG run to stop' })
  @ApiResponse({ status: 200, description: 'DAG run stopped successfully.' })
  @Post(':dagId/:dagRunId/stop')
  async stopDag(@Param('dagId') dagId: string, @Param('dagRunId') dagRunId: string) {
    return this.dagsService.stopDag(dagId, dagRunId);
  }
}
