import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CsvData {
  label: number;
  text: string;
}
@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
 
  private baseUrl = '/api/minio/receive';
  private apiUrlnew = '/api/minio/receivetest';
  private searchUrl = '/api/messages/search';
  constructor(private http: HttpClient) {}

  
  getCsvData(hashtag: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlnew}/${hashtag}`);
  }
  getAllCsvData(bucketName: string, objectName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${bucketName}/${objectName}`);
  }

  searchByHashtag(hashtag: string): Observable<any> {
    let params = new HttpParams().set('hashtag', hashtag);
    return this.http.get<any>(this.searchUrl, { params });
  }

}
