import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../../services/match.service';
import { AuthService } from '../../../services/auth.service';
import { Match } from '../../../models/match.interface';
import { User } from '../../../models/user.interface';
import { Router } from '@angular/router';
import { MatchCardComponent } from "../match-card/match-card";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.html',
  styleUrls: ['./match-list.css'],
  standalone: true,
  imports: [CommonModule, MatchCardComponent,RouterLink],
})
export class MatchListComponent implements OnInit {
  matches: Match[] = [];
  filteredMatches: Match[] = [];
  currentUser: User | null | undefined;
  loading = true;
  error = '';
  activeFilter: 'all' | 'pending' | 'accepted' | 'rejected' | 'completed' = 'all';

  constructor(
    private matchService: MatchService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadMatches();
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  loadMatches(): void {
    this.loading = true;
    this.error = '';

    this.matchService.getUserMatches(this.activeFilter).subscribe({
      next: (response) => {
        this.matches = response;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load matches.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredMatches = this.matches;
    } else {
      this.filteredMatches = this.matches.filter(match => match.status === this.activeFilter);
    }
  }

  onFilterChange(filter: 'all' | 'pending' | 'accepted' | 'rejected' | 'completed'): void {
    this.activeFilter = filter;
    this.loadMatches();
  }

  onStatusUpdated(): void {
    this.loadMatches();
  }
}