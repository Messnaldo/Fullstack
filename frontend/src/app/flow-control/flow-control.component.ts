import { Component, ViewChild, Renderer2, ElementRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { interval, Subscription } from 'rxjs';

import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FlowControlService } from './flow-control.service';
import bootstrap from '../../main.server';
@Component({
  selector: 'app-flow-control',
  standalone: true,
  imports: [FormsModule, CommonModule, NgFor, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './flow-control.component.html',
  styleUrl: './flow-control.component.scss'
})
export class FlowControlComponent {
  // @ViewChild('configModal') configModal!: ElementRef;
  @ViewChild('configModal', { static: false }) configModal!: ElementRef;

  dags: any[] = [];
  selectedConfig: any = [];
  filteredDags: any[] = [];
  searchTerm: string = '';
  newDag: any = { startDate: '', schedule: 'none', hashtag: '' };

  private pollingSubscription: Subscription | null = null;

  constructor(private authService:AuthService,private router:Router,private flowControlService:FlowControlService, private renderer: Renderer2){}

  ngOnInit(): void {
    this.getDags();
    // setInterval(() => this.getDags(), 10000); // Refresh every 10 seconds
    this.setAllDagsPaused(false);

  }
  setAllDagsPaused(isPaused: boolean): void {
    this.flowControlService.setAllDagsPaused(isPaused).subscribe(response => {
      console.log('All DAGs pause status updated:', response);
    });
  }
  getDags(): void {
    this.flowControlService.getDags().subscribe(data => {
      this.dags = data; // Assuming the response is a list of DAGs with latest DAG run
      this.filterDags();
      console.log(data );
    });
  }
  deleteDag(dagId: string): void {
    this.flowControlService.deleteDag(dagId).subscribe(response => {
      console.log(`DAG ${dagId} deleted:`, response);
      this.getDags();
    });
  }
  filterDags(): void {
  if (this.searchTerm.trim() === '') {
    this.filteredDags = [...this.dags];
  } else {
    this.filteredDags = this.dags.filter(dag => dag.hashtag.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }
}
  getStatusColor(state: string): string {
    switch (state) {
      case 'queued':
        return '#9D9D9D'; // Grey
      case 'running':
        return '#00FF7F'; // เขียวอ่อน
      case 'failed':
        return '#F03637'; // Red
      case 'success':
        return '#3DC03C'; // Green
      default:
        return '#9D9D9D'; // Default to grey if unknown state
    }
  }

  getStatusText(state: string): string {
    switch (state) {
      case 'running':
        return 'Running';
      case 'queued':
        return 'Queued';
      case 'failed':
        return 'Failed';
      case 'success':
        return 'Success';
      default:
        return 'Unknown';
    }
  }

// สำหรับอิง bootstrap
  showConfig(config: any): void {
    this.selectedConfig = config;
  }

  hideModal(): void {
    if (this.configModal) {
      this.renderer.setStyle(this.configModal.nativeElement, 'display', 'none');
      this.renderer.setAttribute(this.configModal.nativeElement, 'aria-hidden', 'true');
      this.renderer.removeClass(this.configModal.nativeElement, 'show');
    }
  }


  runDag(dagId: string) {
    this.flowControlService.runDag(dagId).subscribe(response => {
      console.log(`DAG ${dagId} run started:`, response);
      this.startPolling(dagId);
    });
  } 

  saveConfig() {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in yyyy-mm-dd format
    
    // Check if all fields are filled
    if (!this.selectedConfig.startDate || !this.selectedConfig.schedule || !this.selectedConfig.hashtag) {
      alert('Please fill in all required fields.');
      return;
    }

    // Check if start date is in the future
    
  
    this.flowControlService.updateDag(this.selectedConfig.id, this.selectedConfig).subscribe(response => {
      console.log('DAG updated:', response);
      this.getDags();
    });
  }

  startPolling(dagId: string): void {
    this.pollingSubscription = interval(200).subscribe(() => {
      this.flowControlService.getDags().subscribe((data: any) => {
        const dag = data.find((d: any) => d.dag_id === dagId);
        if (dag) {
          this.flowControlService.broadcastStatusUpdate(dag.dag_id, dag.latest_dag_run.state);
        }
        this.dags = data;
        this.filterDags();
      });
    });
  }

  addDag() {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in yyyy-mm-dd format
    
    // Check if all fields are filled
    if (!this.newDag.startDate || !this.newDag.schedule || !this.newDag.hashtag) {
      alert('Please fill in all required fields.');
      return;
    }

    
    
    this.flowControlService.createDag(this.newDag).subscribe(response => {
      console.log('DAG created:', response);
      this.getDags();
      this.newDag = { startDate: '', schedule: 'none', hashtag: '' };
    });
  }
  stopDag(dagId: string, dagRunId: string) {
    this.flowControlService.stopDag(dagId, dagRunId).subscribe(response => {
      console.log(`DAG ${dagId} run stopped:`, response);
      // Optionally, refresh the list of dags
      this.getDags();
    });
  }

  logout()
  {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
