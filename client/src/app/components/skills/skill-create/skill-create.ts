import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SkillService } from '../../../services/skill.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-create',
  templateUrl: './skill-create.html',
  styleUrls: ['./skill-create.css'],
  standalone:true,
  imports:[ ReactiveFormsModule, CommonModule]
})
export class SkillCreateComponent implements OnInit {
  skillForm: FormGroup;
  loading = false;
  error = '';
  
  // Form options
  skillTypes = [
    { value: 'offer', label: 'I can teach this', icon: 'fa-hand-holding-heart', color: '#10b981' },
    { value: 'want', label: 'I want to learn this', icon: 'fa-graduation-cap', color: '#3b82f6' }
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
    { value: 'Online', label: 'Online', icon: 'fa-video' },
    { value: 'In-person', label: 'In-Person', icon: 'fa-users' },
    { value: 'Both', label: 'Both', icon: 'fa-exchange-alt' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private skillService: SkillService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.skillForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      isOffered: [true, Validators.required], // boolean
      category: ['', Validators.required],
      level: ['', Validators.required],
      duration: [null, [Validators.min(15), Validators.max(480)]],
      tags: [''],
      mode: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Check for type parameter in URL
    this.route.queryParams.subscribe(params => {
      if (params['type'] && (params['type'] === 'offer' || params['type'] === 'want')) {
        this.skillForm.patchValue({ type: params['type'] });
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
      duration:this.skillForm.value.duration.toString() +' minutes'
    };
    // console.log("Submitting skill data:",skillData);
    this.skillService.createSkill(skillData).subscribe({
      next: (response) => {
        this.loading = false;
        // Redirect to skills list with success message
        // console.log("Skill created successfully:",response);
        this.router.navigate(['/skills'], { 
          queryParams: { created: 'true' }
        });
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to create skill. Please try again.';
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

  goBack(): void {
    this.router.navigate(['/skills']);
  }

  
 
}