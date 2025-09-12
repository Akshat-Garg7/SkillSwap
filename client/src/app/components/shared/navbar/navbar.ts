import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
// We will create this service later
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.interface';

@Component({
  selector: 'app-navbar',
  standalone:true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [RouterLink]
})
export class NavbarComponent implements OnInit {
  user:User | null=null;
  isLoggedIn: boolean = false;
  userName: string | undefined; // Placeholder name

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = true;
    
    // Example of how you would subscribe to auth changes
    // this.authService.currentUser.subscribe(user => {
    //   this.isLoggedIn = !!user;
    //   this.userName = user ? user.name : null;
    // });
    this.user=this.authService.getCurrentUser()
    // console.log("from navbar",this.user);
    this.userName=this.user?.name;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false; // For demonstration
    this.router.navigate(['/auth/login']); // Redirect to home page
  }
}