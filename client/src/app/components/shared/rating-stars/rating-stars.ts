import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.html',
  styleUrls: ['./rating-stars.css']
})
export class RatingStarsComponent implements OnInit {
  @Input() rating: number = 0;
  @Input() readonly: boolean = false; // To make it non-interactive
  @Output() ratingChange = new EventEmitter<number>();

  stars: boolean[] = [];
  hoverRating: number = 0;

  ngOnInit(): void {
    this.stars = Array(5).fill(false);
  }

  rate(rating: number): void {
    if (this.readonly) return;
    this.rating = rating;
    this.ratingChange.emit(this.rating);
  }

  hover(rating: number): void {
    if (this.readonly) return;
    this.hoverRating = rating;
  }

  resetHover(): void {
    if (this.readonly) return;
    this.hoverRating = 0;
  }
}