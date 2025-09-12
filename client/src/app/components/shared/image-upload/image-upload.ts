import { Component, EventEmitter, Input, Output,SimpleChanges ,OnChanges   } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.html',
  styleUrls: ['./image-upload.css']
})
export class ImageUploadComponent {
  // Accept the current image URL from the parent component
  @Input() currentImage: string | null = null;
  // Emit the selected file object to the parent component
  @Output() imageSelected = new EventEmitter<File>();

  imagePreview: string | ArrayBuffer | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    // This will now correctly receive the full URL like 'http://localhost:3000/api/files/...'
    if (changes['currentImage'] && this.currentImage) {
      this.imagePreview = this.currentImage;
    } else {
      this.imagePreview = '/images/default-avatar.jpg';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imageSelected.emit(file); // Emit the file to the parent

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
