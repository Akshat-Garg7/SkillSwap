import { CommonModule } from '@angular/common';
import { Component, Inject, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
// This interface defines the shape of the data we expect to receive
export interface DialogData {
  title: string;
  message: string;
}

@Component({
  
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.css'],
  standalone:true,
  imports:[CommonModule,MatDialogModule,MatButtonModule]
})
export class ConfirmationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close(false); // Close the dialog, returning 'false'
  }
  
  // The confirm button in the HTML already handles closing and returning 'true'
}