import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { Message } from '../models/message.interface';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) { }

  
  sendMessage(data: { senderId: string|undefined; recipientId: string; matchId: string; content: string; }) {
    this.socket.emit('send_message', data); 
  }

  
  getNewMessage(): Observable<Message> {
    return this.socket.fromEvent<Message>('receive_message');
  }


  joinRoom(userId: string) {
    this.socket.emit('joinRoom', userId);
  }
  joinMatch(matchId: string) {
    this.socket.emit('join_match', matchId);
  }

  leaveMatch(matchId: string) {
    this.socket.emit('leave_match', matchId);
  }
}