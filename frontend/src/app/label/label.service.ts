import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private apiUrl = '/api/minio/receivetest';
  private apiUrlNew = '/api/minio/update-test';
  private searchUrl = '/api/messages/search';
  private hashtagUrl = '/api/messages/hashtag';

  
  constructor(private http: HttpClient) { }

  getCsvData(hashtag: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${hashtag}`);
  }
 
  updateCsvData(hashtag: string, data: any[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrlNew}/${hashtag}`, data);
  }

  getAllHashtags(): Observable<{ hashtag: string }[]> {
    return this.http.get<{ hashtag: string }[]>(this.hashtagUrl);
  }
  searchByHashtag(hashtag: string): Observable<any> {
    return this.http.get<any>(`${this.searchUrl}?hashtag=${hashtag}`);
  }
}
