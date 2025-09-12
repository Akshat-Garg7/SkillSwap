import { Component, Input } from '@angular/core';
import { Message } from '../../../models/message.interface';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  selector: 'app-message-item',
  templateUrl: './message-item.html',
  styleUrls: ['./message-item.css'],
  imports:[CommonModule]
})
export class MessageItemComponent {
  @Input() message!: Message;
  @Input() currentUserId!: string | undefined;

  // This method determines if the message was sent by the current user
  // to apply the correct CSS class for alignment (right vs. left).
  isSentByCurrentUser(): boolean {
    return this.message.sender._id === this.currentUserId;
  }
}