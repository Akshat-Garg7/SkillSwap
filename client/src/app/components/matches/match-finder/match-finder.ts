import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SkillService } from '../../../services/skill.service';
import { MatchService } from '../../../services/match.service';
import { AuthService } from '../../../services/auth.service';
import { Skill } from '../../../models/skill.interface';
import { PotentialMatch } from '../../../models/match.interface'; 
import { User } from '../../../models/user.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchCardComponent } from '../match-card/match-card';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner';


@Component({
  selector: 'app-match-finder',
  templateUrl: './match-finder.html',
  styleUrls: ['./match-finder.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatchCardComponent,LoadingSpinnerComponent] // Add MatchCardComponent here
})
export class MatchFinderComponent implements OnInit {
  currentUser: User | null | undefined;
  userSkills: Skill[] = [];
  // 2. The potential matches property is now correctly typed
  potentialMatches: PotentialMatch[] = []; 
  selectedSkillId: string | null = null;
  loadingSkills = true;
  loadingMatches = false;
  error = '';

  constructor(
    private skillService: SkillService,
    private matchService: MatchService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserSkills();
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  private toArray<T>(val: any): T[] {
    if (Array.isArray(val)) return val as T[];
    if (Array.isArray(val?.skills)) return val.skills as T[];
    if (Array.isArray(val?.matches)) return val.matches as T[];
    if (Array.isArray(val?.data)) return val.data as T[];
    return [];
  }

  loadUserSkills(): void {
    if (!this.currentUser) return;
    this.loadingSkills = true;
    this.skillService.getUserSkills().subscribe({
      next: (response) => {
        this.userSkills = this.toArray<Skill>(response);
        this.loadingSkills = false;
        if (this.userSkills.length > 0) {
          this.selectedSkillId = this.userSkills[0]._id;
          this.findMatches();
        }
      },
      error: (err) => { this.error = 'Failed to load skills.'; this.loadingSkills = false; }
    });
  }

  findMatches(): void {
    if (!this.selectedSkillId) return;
    this.loadingMatches = true;
    this.matchService.findMatches(this.selectedSkillId).subscribe({
      next: (response) => {
        // 3. The generic type here is now correct
        this.potentialMatches = this.toArray<PotentialMatch>(response);
        this.loadingMatches = false;
        console.log("Potential Matches:",this.potentialMatches);
      },
      error: (err) => { this.error = 'Failed to find matches.'; this.loadingMatches = false; }
    });
  }



onSkillSelected(event:Event): void {
  if (this.selectedSkillId) {
    // console.log("Finding matches for clean skill ID:", this.selectedSkillId);
    this.findMatches();
  } else {
    this.potentialMatches = [];
  }
}

  // 4. The function signature is now correct
  createMatchRequest(targetSkill: PotentialMatch): void {
    if (!this.currentUser || !this.selectedSkillId || !targetSkill.owner?._id) {
      this.error = 'Cannot create match due to missing data.';
      return;
    }

    const payload = {
      user1SkillId: this.selectedSkillId,
      user2Id: targetSkill.owner._id,
      user2SkillId: targetSkill._id
    };

    this.matchService.createMatch(payload).subscribe({
      next: () => this.router.navigate(['/matches']),
      error: (err) => this.error = err.error?.message || 'Failed to create match request.'
    });
  }
}