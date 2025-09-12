import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, NgModule } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Message } from '../../../models/message.interface';
import { MessageService } from '../../../services/message.service';
import { SocketService } from '../../../services/socket.service';
import { AuthService } from '../../../services/auth.service';
import { MessageItemComponent } from "../message-item/message-item";

@Component({
  standalone:true,
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  imports: [MessageItemComponent,ReactiveFormsModule]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: Message[] = [];
  messageForm: FormGroup;
  matchId!: string;
  currentUserId!: string|undefined;
  private messageSub!: Subscription;
  recipientId!: string; 

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private socketService: SocketService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.getCurrentUser()?._id;
    this.messageForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('matchId')!;
    this.socketService.joinMatch(this.matchId);
    this.loadMessageHistory();

    // Listen for new messages from Socket.IO
    this.messageSub = this.socketService.getNewMessage().subscribe((message: Message) => {
      if (message.match === this.matchId) {
        this.messages.push(message);
        this.scrollToBottom();
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadMessageHistory(): void {
    this.messageService.getMessages(this.matchId).subscribe(response => {
      this.messages = response.messages;
       const match = response['match'];
       if (match.user1._id.toString() === this.currentUserId) {
        this.recipientId = match.user2._id.toString();
      } else {
        this.recipientId = match.user1._id.toString();
      }
      
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid) {
      return;
    }
    const content = this.messageForm.value.content;

    const messageData = {
      senderId: this.currentUserId,
      recipientId: this.recipientId, // Make sure this is set
      matchId: this.matchId,
      content: content
    };
    
    this.socketService.sendMessage(messageData);
    this.messageForm.reset();
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  ngOnDestroy(): void {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
    this.socketService.leaveMatch(this.matchId); 
  }
}