// In src/app/services/file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiBase}/users_images`; // Assuming apiUrl is 'http://localhost:3000/api'

  constructor(private http: HttpClient) {}

  uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return this.http.post<{ fileId: string }>(`${this.apiUrl}/users/upload`, formData);
}

getProfilePicture(fileId: string) {
  return `${this.apiUrl}/users/file/${fileId}`;
}

}