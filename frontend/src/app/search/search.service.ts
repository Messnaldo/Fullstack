

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class SearchService {
  
  private kafka = '/api/messages';

  constructor(private http: HttpClient) {}
  searchKafka(text: string): Observable<any> {
    return this.http.post<any>(this.kafka, { text });
  }

  getKafkaMessages(): Observable<any[]> {
    return this.http.get<any[]>(this.kafka);
  }
  
}