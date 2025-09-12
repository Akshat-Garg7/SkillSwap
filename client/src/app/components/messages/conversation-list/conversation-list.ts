import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation } from '../../../models/message.interface';
import { MessageService } from '../../../services/message.service';
import { AuthService } from '../../../services/auth.service'; // Assuming you have this service
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  selector: 'app-conversation-list',
  templateUrl: './conversation-list.html',
  styleUrls: ['./conversation-list.css'],
  imports:[RouterLink,CommonModule]
})
export class ConversationListComponent implements OnInit {
  conversations$!: Observable<Conversation[]>;
  currentUserId: string|undefined;

  constructor(
    private messageService: MessageService,
    private authService: AuthService // Inject your auth service
  ) {
    this.currentUserId = this.authService.getCurrentUser()?._id; // Get current user's ID
  }

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.conversations$ = this.messageService.getConversations(this.currentUserId);
    console.log("from conversation-list",this.conversations$)
  }
}