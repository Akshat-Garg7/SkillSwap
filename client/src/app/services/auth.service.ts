import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly API_URL = environment.apiBase;

  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(this.getAuthenticatedUser());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

   public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  // REGISTER
  register(
    name: string,
    email: string,
    password: string,
    bio?: string,
    location?: string
  ): Observable<ApiResponse> {
    const payload = { name, email, password, bio, location };
    return this.http.post<ApiResponse>(`${this.API_URL}/auth/register`, payload);
  }

  // LOGIN
  login(email: string, password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.storeAuthToken(response.token);
          const user = this.decodeToken(response.token);
          this.currentUserSubject.next(user);
        }
      }),
      catchError((error) => {
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }

  // LOGOUT
  logout(): void {
    this.removeAuthToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // CHECK LOGIN STATUS
  isLoggedIn(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp ? decodedToken.exp > currentTime : false;
    } catch {
      return false;
    }
  }

  // GET CURRENT USER OBJECT
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // DECODE JWT INTO USER OBJECT
  private decodeToken(token: string): User | null {
    try {
      const decoded: any = jwtDecode(token);
      return {
        _id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        profilePicture: decoded.profilePicUrl,
        skillsOffered: decoded.skillsToTeach || [],
        skillsWanted: decoded.skillsToLearn || [],
        location: decoded.location,
        createdAt:decoded.createdAt,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // STORE TOKEN LOCALLY
  private storeAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  // GET TOKEN
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  // REMOVE TOKEN
  private removeAuthToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  // RESTORE USER FROM TOKEN
  private getAuthenticatedUser(): User | null {
    const token = this.getAuthToken();
    if (token) {
      if (this.isLoggedIn()) {
        return this.decodeToken(token);
      }
      this.removeAuthToken();
    }
    return null;
  }
  updateUserProfilePicture(newImageFilename: string): void {
    const currentUser = this.currentUserValue;

    if (currentUser) {
      // 1. Update the user object in memory
      currentUser.profilePicture = newImageFilename;

      // 2. Persist the updated user object to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // 3. Notify all subscribed components of the change
      this.currentUserSubject.next(currentUser);
    }
}
}

