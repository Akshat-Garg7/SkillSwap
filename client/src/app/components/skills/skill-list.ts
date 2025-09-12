import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SkillService } from '../../services/skill.service';
import { AuthService } from '../../services/auth.service';
import { Skill } from '../../models/skill.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SkillCardComponent } from './skill-card/skill-card';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone:true,
  selector: 'app-skill-list',
  templateUrl: './skill-list.html',
  styleUrls: ['./skill-list.css'],
  imports: [FormsModule, CommonModule, SkillCardComponent,LoadingSpinnerComponent,MatDialogModule]
})
export class SkillListComponent implements OnInit {
  skills: Skill[] = [];
  filteredSkills: Skill[] = [];
  loading = true;
  error = '';

  // Filters
  activeFilter: 'all' | 'offered' | 'wanted' = 'all';
  searchQuery = '';
  selectedCategory = '';
  selectedLevel = '';

  // Categories for filtering
  categories = [
    'Technology', 'Arts & Design', 'Music', 'Sports & Fitness',
    'Cooking', 'Languages', 'Business', 'Photography',
    'Writing', 'Marketing', 'Other'
  ];

  levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  constructor(
    private skillService: SkillService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['filter'] === 'offered' || params['filter'] === 'wanted' || params['filter'] === 'all') {
        this.activeFilter = params['filter'];
      }
    });

    this.loadSkills();
  }

  private toArray<T>(val: any): T[] {
    if (Array.isArray(val)) return val as T[];
    if (Array.isArray(val?.skills)) return val.skills as T[];
    if (Array.isArray(val?.data)) return val.data as T[];
    return [];
  }

  loadSkills(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.loading = false;
      this.router.navigate(['/auth/login']);
      return;
    }

    this.skillService.getUserSkills().subscribe({
      next: (skills) => {
        // console.log("Skills loaded", skills);
        this.skills = this.toArray<Skill>(skills);
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load skills';
        this.loading = false;
        this.skills = [];
        this.filteredSkills = [];
      }
    });
  }

  applyFilters(): void {
    const source = this.toArray<Skill>(this.skills);
    const filtered: Skill[] = [];

    for (const skill of source) 
    {
      // Type filter
      if (this.activeFilter !== 'all') {
        const wantOffer = this.activeFilter === 'offered';
        if (wantOffer && !skill.isOffered) continue;
        if (!wantOffer && skill.isOffered) continue;
      }

      // Search filter
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const name = (skill.name || '').toLowerCase();
        const desc = (skill.description || '').toLowerCase();
        const cat  = (skill.category || '').toLowerCase();
        if (!name.includes(q) && !desc.includes(q) && !cat.includes(q)) continue;
      }

      // Category filter
      if (this.selectedCategory && (skill.category || '') !== this.selectedCategory) continue;

      // Level filter
      if (this.selectedLevel && (skill.level || '') !== this.selectedLevel) continue;

      filtered.push(skill);
    }

    // console.log("Filtered skills:", filtered);
    this.filteredSkills = filtered;
  }

  onFilterChange(filter: 'all' | 'offered' | 'wanted'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearchChange(): void { this.applyFilters(); }
  onCategoryChange(): void { this.applyFilters(); }
  onLevelChange(): void { this.applyFilters(); }

  clearFilters(): void {
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedLevel = '';
    this.applyFilters();
  }

  navigateToCreate(): void {
    this.router.navigate(['/skills/create']);
  }

  navigateToEdit(skillId: string): void {
    this.router.navigate(['/skills/edit', skillId]);
  }

  deleteSkill(skillId: string): void {
  // 1. Open the custom dialog instead of using confirm()
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '400px',
    data: { 
      title: 'Delete Skill', 
      message: 'Are you sure you want to delete this skill?' 
    }
  });

  // 2. Wait for the dialog to close
  dialogRef.afterClosed().subscribe(result => {
    // 3. If the user confirmed (result is true), run the original deletion logic
    if (result) {
      this.skillService.deleteSkill(skillId).subscribe({
        next: () => {
          // This is your original success logic
          const updated: Skill[] = [];
          for (const s of this.toArray<Skill>(this.skills)) {
            if (s._id !== skillId) updated.push(s);
          }
          this.skills = updated;
          this.applyFilters();
        },
        error: () => {
          alert('Failed to delete skill');
        }
      });
    }
  });
}

  // getSkillTypeColor(type: string): string {
  //   return type === 'offer' ? '#10b981' : '#3b82f6';
  // }

  // getSkillTypeIcon(type: string): string {
  //   return type === 'offer' ? 'fa-hand-holding-heart' : 'fa-graduation-cap';
  // }

  getOfferedCount(): number {
    let count = 0;
    for (const s of this.toArray<Skill>(this.skills)) {
      if (s.isOffered === true) count++;
    }
    return count;
  }

  getWantedCount(): number {
    let count = 0;
    for (const s of this.toArray<Skill>(this.skills)) {
      if (s.isOffered === false) count++;
    }
    return count;
  }
}
