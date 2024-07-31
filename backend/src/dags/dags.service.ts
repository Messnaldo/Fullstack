import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Dag } from './dag.entity';
import { CreateDagDto } from './create-dag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v3 as uuidv3 } from 'uuid';

@Injectable()
export class DagsService {
  constructor(@InjectRepository(Dag)
  private dagRepository: Repository<Dag>,){}
  private readonly baseUrl: string = 'http://192.168.13.74:28080/api/v1/dags';
  // private readonly baseUrl: string = 'http://10.0.1.54:28080/api/v1/dags';
  private readonly NAMESPACE_URL = uuidv3.URL;

  private getAuthHeaders() {
    const token = 'YWlyZmxvdzphaXJmbG93'; // Replace with your actual Basic auth token
    return {
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
  }
  async setIsPaused(isPaused: boolean) {
    const dags = await this.getDags();
    const pausePromises = dags.map(dag => 
      axios.patch(`${this.baseUrl}/${dag.dag_id}`, { is_paused: isPaused }, this.getAuthHeaders())
    );
    await Promise.all(pausePromises);
    return { message: 'All DAGs pause status updated' };
  }


async getDags() {
  const response = await axios.get(this.baseUrl, this.getAuthHeaders());
  const dags = response.data.dags;

  const dagEntities = await this.dagRepository.find(); // Get all dag entities from the database
  const validDagIds = dagEntities.map(dag => dag.dag_id); // Extract valid dag_ids

  const dagRunsPromises = dags
    .filter(dag => validDagIds.includes(dag.dag_id)) // Filter only valid dag_ids
    .map(async (dag) => {
      const dagRunsResponse = await axios.get(`${this.baseUrl}/${dag.dag_id}/dagRuns`, this.getAuthHeaders());
      const dagRuns = dagRunsResponse.data.dag_runs;

      const latestDagRun = dagRuns.reduce((latest, current) => {
        const latestDate = new Date(latest.start_date).getTime();
        const currentDate = new Date(current.start_date).getTime();
        return currentDate > latestDate ? current : latest;
      }, dagRuns[0]);

      // Fetch hashtag from database
      const dagEntity = dagEntities.find(entity => entity.dag_id === dag.dag_id);

      return {
        dag_id: dag.dag_id,
        latest_dag_run: latestDagRun,
        hashtag: dagEntity?.hashtag || '',
        startDate: dagEntity?.startDate || '',
        schedule: dagEntity?.schedule || '',
        id: dagEntity?.id || null
      };
    });

  const dagsWithLatestDagRuns = await Promise.all(dagRunsPromises);
  return dagsWithLatestDagRuns;
}

  async create(createDagDto: CreateDagDto) {
    const uuidKey = uuidv3(createDagDto.hashtag, this.NAMESPACE_URL);
    const dagId = `scraper${uuidKey}`;
    
    const dag = this.dagRepository.create({ ...createDagDto, dag_id: dagId });
    await this.dagRepository.save(dag);
    return dag;
  }
  findAll() {
    return this.dagRepository.find();
  }

  async deleteDag(dagId: string): Promise<boolean> {
    const result = await this.dagRepository.delete({ dag_id: dagId });
    return result.affected > 0;
  }

  async runDag(dagId: string) {
    const response = await axios.post(`${this.baseUrl}/${dagId}/dagRuns`, {}, this.getAuthHeaders());
    return response.data;
  }

  async stopDag(dagId: string, dagRunId: string) {
    const response = await axios.post(`${this.baseUrl}/${dagId}/dagRuns/${dagRunId}/clear`, {}, this.getAuthHeaders());
    return response.data;
  }
  findOne(id: string): Promise<Dag> {
    return this.dagRepository.findOneBy({ id: parseInt(id, 10) });
  }

  async updateDag(id: string, updateDagDto: Partial<CreateDagDto>): Promise<Dag> {
    // Update only startDate and schedule
    const updateData = {
      startDate: updateDagDto.startDate,
      schedule: updateDagDto.schedule,
    };
    await this.dagRepository.update(id, updateData);
    return this.dagRepository.findOneBy({ id: parseInt(id, 10) });
  }
}
