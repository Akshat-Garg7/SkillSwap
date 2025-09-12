import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { Match, PotentialMatch } from '../../../models/match.interface';
import { Skill } from '../../../models/skill.interface';
import { User } from '../../../models/user.interface';
import { MatchService } from '../../../services/match.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// ... other imports

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, FontAwesomeModule],
  templateUrl: './match-card.html',
  styleUrls: ['./match-card.css']
})
export class MatchCardComponent implements OnInit {
  @Input() match?: Match;
  @Input() potentialMatch?: PotentialMatch;
  @Input() currentUserId?: string | null;

  // FIX: This emitter is for the finder, so it emits the PotentialMatch
  @Output() createMatchRequest = new EventEmitter<PotentialMatch>();
  @Output() statusUpdated = new EventEmitter<void>();

  // Display properties
  otherUser!: User;
  mySkill!: Skill;
  theirSkill!: Skill;
  
  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    console.log("From match-card.ts- match:",this.match," potentialMatch:",this.potentialMatch)
    if (this.match && this.currentUserId) {
      this.otherUser = this.match.user1._id === this.currentUserId ? this.match.user2 : this.match.user1;
      this.mySkill = this.match.user1._id === this.currentUserId ? this.match.user1Skill : this.match.user2Skill;
      this.theirSkill = this.match.user1._id === this.currentUserId ? this.match.user2Skill : this.match.user1Skill;
    } else if (this.potentialMatch) {
      this.otherUser = this.potentialMatch.owner;
      this.theirSkill = this.potentialMatch;
      // 'mySkill' isn't known inside this card in the finder context, so we don't set it.
    }
  }

  // This method is for the finder context
  onProposeMatch(): void {
    this.createMatchRequest.emit(this.potentialMatch);
  }

  isInitiatedByCurrentUser(): boolean {
    // FIX: 'initiatedBy' is a string ID, not a populated object
    return this.match?.initiatedBy === this.currentUserId;
  }

  isPending(): boolean {
    return this.match?.status === 'pending';
  }

  updateStatus(newStatus: 'accepted' | 'rejected'): void {
    if (!this.match) {
      
      console.error('Match is undefined. Cannot update status.');
      return;
    }
    console.log("From match-card.ts",this.match);   
    this.matchService.respondToMatch(this.match._id, newStatus).subscribe({
      next: () => {
        this.statusUpdated.emit(); // Notify the parent to reload the list
      },
      error: (err) => {
        console.error('Failed to update match status:', err);
      }
    });
  }
}

