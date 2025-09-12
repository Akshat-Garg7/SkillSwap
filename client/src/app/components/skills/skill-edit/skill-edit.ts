import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SkillService } from '../../../services/skill.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Skill } from '../../../models/skill.interface';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone:true,
  selector: 'app-skill-edit',
  templateUrl: './skill-edit.html',
  styleUrls: ['./skill-edit.css'],
  imports:[ReactiveFormsModule,CommonModule,MatButtonModule,MatDialogModule]
})
export class SkillEditComponent implements OnInit {
  skillForm: FormGroup;
  loading = false;
  loadingSkill = true;
  error = '';
  skillId = '';
  originalSkill: Skill | null = null;
  
  // Form options (same as create component)
  skillTypes = [
    { value: true, label: 'I can teach this', icon: 'fa-hand-holding-heart', color: '#10b981' },
    { value: false, label: 'I want to learn this', icon: 'fa-graduation-cap', color: '#3b82f6' }
  ];
  
  categories = [
    'Technology', 'Arts & Design', 'Music', 'Sports & Fitness',
    'Cooking', 'Languages', 'Business', 'Photography',
    'Writing', 'Marketing', 'Other'
  ];
  
  levels = [
    { value: 'Beginner', description: 'Basic understanding' },
    { value: 'Intermediate', description: 'Good working knowledge' },
    { value: 'Advanced', description: 'Deep expertise' },
  ];
  
  formats = [
    { value: 'online', label: 'Online', icon: 'fa-video' },
    { value: 'in-person', label: 'In Person', icon: 'fa-users' },
    { value: 'both', label: 'Both', icon: 'fa-exchange-alt' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private skillService: SkillService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) {
      this.skillForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      isOffered: [true, Validators.required], // ✅ boolean
      category: ['', Validators.required],
      level: ['', Validators.required],
      duration: [null, [Validators.min(15), Validators.max(480)]],
      tags: [''],
      mode: ['', Validators.required],
      isActive: [true]
    });

  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.skillId = this.route.snapshot.params['id'];
    if (!this.skillId) {
      this.router.navigate(['/skills']);
      return;
    }

    this.loadSkill();
  }

  loadSkill(): void {
    this.loadingSkill = true;
    
    this.skillService.getSkillById(this.skillId).subscribe({
      next: (response:any) => {
        const skill=response.skill;
        this.originalSkill = skill;
        // console.log("from loadedskill:",skill?.owner?.toString());
        // Check if current user owns this skill
        
        const currentUser = this.authService.getCurrentUser();
        if ( skill.owner?.toString() !== currentUser?._id) {
          this.router.navigate(['/skills']);
          return;
        }

        // Populate form with skill data
          this.skillForm.patchValue({
        name: skill.name,
        description: skill.description,
        isOffered: skill.isOffered, // true for offered, false for wanted
        category: skill.category,
        level: skill.level,
        mode: skill.mode || 'Both',
        duration: skill.duration || '',
        tags: skill.tags ? skill.tags.join(', ') : '',
        isActive: skill.isActive !== false,
      });

        
        this.loadingSkill = false;
      },
      error: (error) => {
        this.error = 'Failed to load skill';
        this.loadingSkill = false;
      }
    });
  }

  // Getter methods for easy access to form controls
  get name() { return this.skillForm.get('name'); }
  get description() { return this.skillForm.get('description'); }
  get isOffered() { return this.skillForm.get('isOffered'); }
  get category() { return this.skillForm.get('category'); }
  get level() { return this.skillForm.get('level'); }
  get duration() { return this.skillForm.get('duration'); }
  get tags() { return this.skillForm.get('tags'); }
  get mode() { return this.skillForm.get('mode'); }

  onSubmit(): void {
    if (this.skillForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const skillData = {
      ...this.skillForm.value,
      tags: this.processTags(this.skillForm.value.tags),
      duration:this.skillForm.value.duration.toString() 
    };
    console.log("Submitting skill data++++:",skillData,this.skillId);
    

    this.skillService.updateSkill(this.skillId, skillData).subscribe({
      next: (response) => {
        this.loading = false;
        // Redirect to skills list with success message
        console.log("Skill updated successfully:",response);
        this.router.navigate(['/skills'], { 
          queryParams: { updated: 'true' }
        });
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to update skill. Please try again.';
      }
    });
  }

  ondeleteSkill(): void {
  // 1. Open the dialog by passing your component and data to it
  console.log("1");
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '400px',
    data: { 
      title: 'Delete Skill', 
      message: 'Are you sure you want to delete this skill? This action cannot be undone.' 
    }
  });

  // 2. Subscribe to the afterClosed event, which fires when the dialog is closed
  console.log("2");
  dialogRef.afterClosed().subscribe(result => {
    // 3. Only proceed if the user clicked the "Confirm" button (which returns true)
    console.log("3");
    if (result) {
      this.loading = true;
      
      this.skillService.deleteSkill(this.skillId).subscribe({
        next: () => {
          this.loading = false;
          // Successfully deleted, navigate away
          console.log("4");
          this.router.navigate(['/skills'], { 
            
            queryParams: { deleted: 'true' }
          });
        },
        error: (error) => {
          this.loading = false;
          // Handle error (e.g., show a snackbar or alert)
          console.error('Failed to delete skill', error);
          alert('Failed to delete skill. Please try again.');
        }
      });
    }
  });
}

  private processTags(tagsString: string): string[] {
    if (!tagsString.trim()) return [];
    
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
  }

  private markFormGroupTouched(): void {
    Object.keys(this.skillForm.controls).forEach(key => {
      const control = this.skillForm.get(key);
      control?.markAsTouched();
    });
  }

  getSelectedTypeInfo() {
    return this.skillTypes.find(isOffered => isOffered.value === this.skillForm.value.isOffered);
  }

  getSelectedLevelInfo() {
    return this.levels.find(level => level.value === this.skillForm.value.level);
  }

  goBack(): void {
    this.router.navigate(['/skills']);
  }

  // Helper method to get character count for description
  getDescriptionCharCount(): number {
    return this.skillForm.value.description?.length || 0;
  }

  // Helper method to get tag count
  getTagCount(): number {
    const tags = this.processTags(this.skillForm.value.tags || '');
    return tags.length;
  }

  // Method to suggest duration based on level
  onLevelChange(): void {
    const level = this.skillForm.value.level;
    const currentDuration = this.skillForm.value.duration;
    
    // Only suggest if no duration is set or if it's still the original duration
    if (level && (!currentDuration || currentDuration === this.originalSkill?.duration)) {
      let suggestedDuration = 60; // default 1 hour
      
      switch (level) {
        case 'Beginner':
          suggestedDuration = 30;
          break;
        case 'Intermediate':
          suggestedDuration = 60;
          break;
        case 'Advanced':
          suggestedDuration = 90;
          break;
      }
      
      this.skillForm.patchValue({ duration: suggestedDuration });
    }
  }

  // Check if form has changes
  hasChanges(): boolean {
    if (!this.originalSkill) return false;
    
    const currentData = {
      ...this.skillForm.value,
      tags: this.processTags(this.skillForm.value.tags),
    };
    
    return (
      currentData.name !== this.originalSkill.name ||
      currentData.description !== this.originalSkill.description ||
      currentData.isOffered !== this.originalSkill.isOffered ||
      currentData.category !== this.originalSkill.category ||
      currentData.level !== this.originalSkill.level ||
      currentData.duration !== (this.originalSkill.duration || '') ||
      JSON.stringify(currentData.tags) !== JSON.stringify(this.originalSkill.tags || []) ||
      currentData.isActive !== (this.originalSkill.isActive !== false)
    );
  }

  resetForm(): void {
    if (this.originalSkill && confirm('Are you sure you want to reset all changes?')) {
      this.skillForm.patchValue({
        name: this.originalSkill.name,
        description: this.originalSkill.description,
        isOffered: this.originalSkill.isOffered,
        category: this.originalSkill.category,
        level: this.originalSkill.level,
        duration: this.originalSkill.duration || '',
        tags: this.originalSkill.tags ? this.originalSkill.tags.join(', ') : '',
        isActive: this.originalSkill.isActive !== false
      });
    }
  }
}