import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Skill } from '../models/skill.interface';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private readonly API_URL = `${environment.apiBase}/skills`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  createSkill(skillData: Omit<Skill, '_id' | 'owner' | 'createdAt' | 'updatedAt'>): Observable<Skill> {
    const ownerId = this.authService.getCurrentUser()?._id;

  if (!ownerId) {
    return throwError(() => new Error('User is not authenticated. Cannot create skill.'));
  }

  const fullSkillData = {
    ...skillData,   
    owner: ownerId  
  };

  console.log("Sending complete data to backend:", fullSkillData);
    return this.http.post<Skill>(this.API_URL, fullSkillData);
  }
  
  getUserSkills(): Observable<Skill[]> {
    // console.log("IN skill service",this.http.get<Skill[]>(this.API_URL));
    return this.http.get<Skill[]>(this.API_URL);
  }
  
  getSkillById(id: string): Observable<Skill> {
    return this.http.get<Skill>(`${this.API_URL}/${id}`);
  }
  
  updateSkill(id: string, skillData: Partial<Skill>): Observable<Skill> {
     const ownerId = this.authService.getCurrentUser()?._id;

  if (!ownerId) {
    return throwError(() => new Error('User is not authenticated. Cannot create skill.'));
  }

  const fullSkillData = {
    ...skillData,   
    owner: ownerId  
  };

  console.log("Sending complete data to backend:", fullSkillData);
    return this.http.put<Skill>(`${this.API_URL}/${id}`, fullSkillData);
  }
  
  deleteSkill(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}