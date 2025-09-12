import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Skill } from '../../../models/skill.interface'; // Adjust path if needed
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';
import {
  faHandHoldingHeart,
  faGraduationCap,
  faVideo,
  faUsers,
  faExchangeAlt,
  faQuestion,
  faEdit,
  faTrash,
  faComment,
  faClock,
  faPauseCircle,
  faArrowRight,
  faInfoCircle,
  faSpinner,
  faTag,
  faStar,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
@Component({
  selector: 'app-skill-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TitleCasePipe,MatDialogModule],
  templateUrl: './skill-card.html',
  styleUrls: ['./skill-card.css']
})
export class SkillCardComponent {
  constructor(public dialog: MatDialog) {
  library.add(this.icons.edit, this.icons.trash);
}
  @Input() showActions = true;
  @Input() skill!: Skill;
  @Input() showUser = false;
  @Input() compact = false;

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() contact = new EventEmitter<string>();
  @Output() view = new EventEmitter<string>();
  

  icons = {
    offering: faHandHoldingHeart,
    wanting: faGraduationCap,
    video: faVideo,
    users: faUsers,
    both: faExchangeAlt,
    question: faQuestion,
    edit: faEdit,
    trash: faTrash,
    comment: faComment,
    clock: faClock,
    pause: faPauseCircle,
    arrow: faArrowRight,
    info: faInfoCircle,
    spinner: faSpinner,
    tag: faTag,
    star: faStar,
    map: faMapMarkerAlt
  };

  onEdit(event: Event): void {
    event.stopPropagation(); 
    this.edit.emit(this.skill._id);
  }

  onDelete(event: Event): void {
  // Keep this to prevent parent elements from also firing a click event
  event.stopPropagation();

  // Open the custom dialog instead of the browser's confirm()
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '400px',
    data: { 
      title: 'Delete Skill', 
      message: `Are you sure you want to delete "${this.skill.name}"?` 
    }
  });

  // Wait for the dialog to close
  dialogRef.afterClosed().subscribe(result => {
    // Only emit the delete event if the user confirmed
    if (result) {
      this.delete.emit(this.skill._id);
    }
  });
}

  onContact(event: Event): void {
    event.stopPropagation();
    this.contact.emit(this.skill.owner._id);
  }

  onView(): void {
    this.view.emit(this.skill._id);
  }

  getSkillTypeColor(): string {
    return this.skill.isOffered ? '#10b981' : '#3b82f6';
  }

  getSkillTypeIcon(): any {
    return this.skill.isOffered ? this.icons.offering : this.icons.wanting;
  }

  getSkillTypeLabel(): string {
    return this.skill.isOffered ? 'Offering' : 'Wanting';
  }

  getLevelColor(): string {
    switch (this.skill.level) {
      case 'Beginner': return '#f59e0b';
      case 'Intermediate': return '#3b82f6';
      case 'Advanced': return '#8b5cf6';
      default: return '#718096';
    }
  }

  getFormatIcon(): any {
    // Making the check case-insensitive to be more robust
    switch (this.skill.mode?.toLowerCase()) {
      case 'online': return this.icons.video;
      case 'in-person': return this.icons.users;
      case 'both': return this.icons.both;
      default: return this.icons.question;
    }
  }

  getTimeAgo(): string {
    if (!this.skill.createdAt) return '';
    const now = new Date();
    const created = new Date(this.skill.createdAt);
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  truncateDescription(maxLength: number): string {
    if (!this.skill.description || this.skill.description.length <= maxLength) {
      return this.skill.description;
    }
    return this.skill.description.substring(0, maxLength).trim() + '...';
  }
}