import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SkillService } from '../../services/skill.service';
import { MatchService } from '../../services/match.service';
import { User } from '../../models/user.interface';
import { Skill } from '../../models/skill.interface';
import { Match } from '../../models/match.interface';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports:[ LoadingSpinnerComponent]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  skillsOffered: Skill[] = [];
  wantedSkills: Skill[] = [];
  recentMatches: Match[] = [];
  loading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private skillService: SkillService,
    private matchService: MatchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.loadDashboardData();
    } else {
      this.router.navigate(['/login']);
    }
  }

  /** Utility to normalize any value into an array */
  private toArray<T>(val: any): T[] {
    if (Array.isArray(val)) return val as T[];
    if (Array.isArray(val?.skills)) return val.skills as T[];
    if (Array.isArray(val?.data)) return val.data as T[];
    return [];
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      skills: this.skillService.getUserSkills(),
      // matches: this.matchService.getUserMatches()
    }).subscribe({
      next: ({ skills }) => {
        const normalizedSkills = this.toArray<Skill>(skills);
        // const normalizedMatches = this.toArray<Match>(matches);

        // Manual filtering instead of .filter()
        const offered: Skill[] = [];
        const wanted: Skill[] = [];

        for (const skill of normalizedSkills) {
          if (skill.isOffered === true) {
            offered.push(skill);
          } else {
            wanted.push(skill);
          }
        }

        // const recent: Match[] = [];
        // for (let i = 0; i < normalizedMatches.length && i < 5; i++) {
        //   recent.push(normalizedMatches[i]);
        // }

        this.skillsOffered = offered;
        this.wantedSkills = wanted;
        // this.recentMatches = recent;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getOtherUser(match: Match): User {
    return match.user1._id === this.user?._id ? match.user2 : match.user1;
  }

  getUserSkill(match: Match): Skill {
    return match.user1._id === this.user?._id ? match.user1Skill : match.user2Skill;
  }

  getOtherUserSkill(match: Match): Skill {
    return match.user1._id === this.user?._id ? match.user2Skill : match.user1Skill;
  }

  acceptMatch(matchId: string): void {
    this.matchService.updateMatchStatus(matchId, 'accepted').subscribe({
      next: () => {
        for (const match of this.recentMatches) {
          if (match._id === matchId) {
            match.status = 'accepted';
            break;
          }
        }
      },
      error: (err) => {
        console.error('Error accepting match:', err);
      }
    });
  }

  openChat(match: Match): void {
    this.router.navigate(['/messages', match._id]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  AddSkill():void{
    this.router.navigate(['/skills/create']);
  }
  FindMatches():void{
    this.router.navigate(['/matches/find']);
  }
  Message():void{
    this.router.navigate(['/messages']);
  }
}
