import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match } from '../models/match.interface';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private readonly API_URL = `${environment.apiBase}/matches`;

  constructor(private http: HttpClient) {}

  findMatches(skillId: string): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.API_URL}/find?skillId=${skillId}`);
  }

  // In your match.service.ts

  createMatch(matchData: { user1SkillId: string; user2Id: string; user2SkillId: string; }): Observable<Match> {
    return this.http.post<Match>(this.API_URL, matchData);
  }

  getUserMatches(status?: string): Observable<Match[]> {
    let params = new HttpParams();
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    
    return this.http.get<{ matches: Match[] }>(this.API_URL, { params }).pipe(
      map(response => response.matches)
    );
  }


  updateMatchStatus(
    matchId: string,
    status: 'accepted' | 'rejected' | 'completed'
  ): Observable<Match> {
    return this.http.patch<Match>(`${this.API_URL}/${matchId}/status`, { status });
  }

  respondToMatch(matchId: string,response: 'accepted' | 'rejected' ): Observable<Match> {
    return this.http.patch<Match>(`${this.API_URL}/${matchId}/respond`, { response });
  }
}