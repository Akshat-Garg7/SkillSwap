import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../../../models/user.interface';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
// Import your SkillCardComponent if you want to display skills
// import { SkillCardComponent } from '../../skills/skill-card/skill-card.component';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule,
    MatCardModule,             // For mat-card component
    MatChipsModule,             // For individual mat-chip components
    MatProgressSpinnerModule, 
  MatButtonModule,], // Add SkillCardComponent here if used
  templateUrl: './profile-view.html',
  styleUrls: ['./profile-view.css']
})
export class ProfileViewComponent implements OnInit {
  user$!: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    // CHECKPOINT 1: Is the AuthService providing a user?
    console.log('Checkpoint 1: Current User from AuthService:', currentUser);

    if (currentUser?._id) {
      // CHECKPOINT 2: Is the component trying to fetch the profile?
      console.log('Checkpoint 2: User ID is valid. Fetching profile for ID:', currentUser._id);

      this.user$ = this.userService.getUserProfile(currentUser._id).pipe(
        // CHECKPOINT 3: What is the raw response from the API?
        tap(response => console.log('Checkpoint 3: Raw API response (before map):', response)),

        // This extracts the nested 'user' object from the API response
        map((response: any) => response.user),

        // CHECKPOINT 4: What does the data look like after the 'map' operator?
        tap(user => console.log('Checkpoint 4: Final user object (for template):', user)),
        
        catchError(error => {
          console.error('ERROR: Failed to load user profile.', error);
          return of(null);
        })
      );
    } else {
      console.error('ERROR: Could not get current user from AuthService, or user has no ID.');
    }
  }
}