import { User } from './user.interface';
import { Skill } from './skill.interface';

export interface PotentialMatch extends Skill {
  matchScore?: number;
}

export interface Match {
  _id: string;
  user1: User;       
  user2: User;       
  user1Skill: Skill; 
  user2Skill: Skill; 
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  matchScore: number;

  initiatedBy: string; 

  createdAt: string;
  updatedAt: string;

  messages: string[]; 
}