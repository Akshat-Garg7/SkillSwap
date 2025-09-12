import { Routes } from '@angular/router';
// This is an array of routes for the 'skills' feature
export const SKILLS_ROUTES: Routes = [
  { path: 'create',loadComponent: () => import('./skill-create/skill-create').then(m => m.SkillCreateComponent)},
  { path: 'edit/:id', loadComponent: () => import('./skill-edit/skill-edit').then(m => m.SkillEditComponent)},
  { path: 'card', loadComponent: () => import('./skill-card/skill-card').then(m => m.SkillCardComponent), },
  { path: '', loadComponent: () => import('./skill-list').then(m => m.SkillListComponent),},
];