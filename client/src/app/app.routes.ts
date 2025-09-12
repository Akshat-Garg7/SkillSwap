import { Routes } from '@angular/router';

// Import Layouts
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

// Import Guards
import { authGuard } from './guards/auth.guard';

// Import Page Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { MatchListComponent } from './components/matches/match-list/match-list';
import { MatchFinderComponent } from './components/matches/match-finder/match-finder';
import { ConversationListComponent } from './components/messages/conversation-list/conversation-list';
import { ChatComponent } from './components/messages/chat/chat';
import { ProfileViewComponent } from './components/profile/profile-view/profile-view';
import { ProfileEditComponent } from './components/profile/profile-edit/profile-edit';

export const routes: Routes = [
  // Routes for unauthenticated users, wrapped in the AuthLayout
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },

  // Routes for authenticated users, wrapped in the MainLayout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Apply the guard once to all children
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'skills',
        loadChildren: () =>
          import('./components/skills/skill.routes').then(
            (m) => m.SKILLS_ROUTES
          ),
      },
      { path: 'matches', component: MatchListComponent },
      { path: 'matches/find', component: MatchFinderComponent },
      { path: 'messages', component: ConversationListComponent },
      { path: 'messages/:matchId', component: ChatComponent },
      { path: 'profile', component: ProfileViewComponent },
      { path: 'profile/edit', component: ProfileEditComponent },
      
      // Redirect from the base empty path ('/') to the dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Wildcard route: redirect any unknown paths to the dashboard
  { path: '**', redirectTo: '', pathMatch: 'full' },
];