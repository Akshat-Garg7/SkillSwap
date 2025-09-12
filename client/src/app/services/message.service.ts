import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Conversation, Message } from '../models/message.interface';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiBase}/messages`;

  constructor(private http: HttpClient) {}

  getConversations(userId: string|undefined): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations/${userId}`);
  }

  getMessages(matchId: string): Observable<{
    [x: string]: any; messages: Message[] 
}> {
    return this.http.get<{ messages: Message[] }>(`${this.apiUrl}/${matchId}`);
  }

  sendMessage(matchId: string, content: string): Observable<{ data: Message }> {
    return this.http.post<{ data: Message }>(`${this.apiUrl}/${matchId}`, { content });
  }
}
