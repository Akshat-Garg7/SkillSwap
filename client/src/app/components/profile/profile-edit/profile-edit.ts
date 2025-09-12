import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../models/user.interface';
import {environment} from '../../../../environments/environment'
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { FileUploadService } from '../../../services/file-upload.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ImageUploadComponent } from '../../shared/image-upload/image-upload';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,MatFormFieldModule,
    MatInputModule,
    MatButtonModule,ImageUploadComponent],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile-edit.css']
})
export class ProfileEditComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: any = {};
  selectedFile: File | null = null;
  feedbackMessage: string | null = null;
  private filesUrl = `${environment.apiBase}/files/`;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      location: [''],
      bio: ['', Validators.maxLength(500)]
    });

    const user = this.authService.getCurrentUser();
    if (user?._id) {
      this.userService.getUserProfile(user._id).subscribe((userData) => {
        if (userData.profilePicture) {
          userData.profilePicture = this.filesUrl + userData.profilePicture;
        }
        this.currentUser = userData;
        this.profileForm.patchValue(userData);
      });
    }
  }

    onImageSelected(file: File): void {
    this.selectedFile = file;
  }

uploadPicture(): void {
  if (this.selectedFile) {
    this.fileUploadService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (response) => {
        if (response && response.fileId) {
          this.feedbackMessage = 'Profile picture updated successfully!';

          // Update currentUser profilePicture with GridFS fileId
          this.currentUser.profilePicture = response.fileId;

          // Update preview instantly
          this.currentUser.profilePictureUrl = this.fileUploadService.getProfilePicture(response.fileId);

          this.selectedFile = null;
        }
      },
      error: () => this.feedbackMessage = 'Upload failed. Please try again.'
    });
  }
}



  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.userService.updateUserProfile(this.profileForm.value).subscribe({
      next: () => {
        this.feedbackMessage = 'Profile updated successfully!';
        setTimeout(() => this.router.navigate(['/profile']), 1500); // Redirect after a short delay
      },
      error: () => this.feedbackMessage = 'Update failed. Please try again.'
    });
  }
}