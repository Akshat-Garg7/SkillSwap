// src/app/models/skill.interface.ts

import { User } from './user.interface';

export interface Skill {
  _id: string;
  owner: User;
  name: string;
  description: string;
  category: 'Technology' | 'Arts' | 'Music' | 'Sports' | 'Cooking' | 'Languages' | 'Business' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  mode: 'Online' | 'In-person' | 'Both';
  isOffered: boolean;
  tags?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}