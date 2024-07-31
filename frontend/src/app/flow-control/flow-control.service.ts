import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FlowControlService {
  private apiUrl = '/api/dags';  // URL ของ backend
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic YWlyZmxvdzphaXJmbG93' // เปลี่ยนเป็น token ของคุณ
    })
  };
  constructor(private http: HttpClient) { }
  private statusUpdateSubject = new Subject<any>();
  deleteDag(dagId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dagId}`, this.httpOptions);
  }
  setAllDagsPaused(isPaused: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/pause-all`, { is_paused: isPaused });
  }
  getDags(): Observable<any> {
    return this.http.get(this.apiUrl, this.httpOptions);
  }
  runDag(dagId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${dagId}/run`, {}, this.httpOptions);
  }

  stopDag(dagId: string, dagRunId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${dagId}/${dagRunId}/stop`, {}, this.httpOptions);
  }
  createDag(dagData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, dagData, this.httpOptions);
  }
  broadcastStatusUpdate(dagId: string, status: string): void {
    this.statusUpdateSubject.next({ dagId, status });
  }
  updateDag(dagId: string, dagConfig: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${dagId}`, dagConfig, this.httpOptions);
  }
  getDag(dagId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${dagId}`, this.httpOptions);
  }
}
