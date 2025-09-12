import { Skill } from './skill.interface';
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string; // Optional property
  location?: string;
  bio?: string;
  skillsOffered: Skill[]; // Array of skills the user can teach
  skillsWanted: Skill[]; // Array of skills the user wants to learn
  createdAt: string;
}