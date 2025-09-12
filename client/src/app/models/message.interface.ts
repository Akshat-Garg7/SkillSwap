import { User } from './user.interface'; 

export interface Message {
  _id: string;
  sender: User; 
  recipient: string; 
  match: string; 
  content: string;
  createdAt: string; 
  isRead: boolean;
}

export interface Conversation {
  _id: string; 
  user: User; 
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}