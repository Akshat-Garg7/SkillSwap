import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  imports: [RouterLink,RouterLinkActive ]
})
export class SidebarComponent implements OnInit {

  menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠', exact: true },
  { path: '/profile', label: 'My Profile', icon: '👤', exact: false },
  { path: '/skills/my-skills', label: 'My Skills', icon: '🛠️', exact: false },
  { path: '/messages', label: 'Messages', icon: '💬', exact: false },
];

  constructor() { }

  ngOnInit(): void {
  }



}