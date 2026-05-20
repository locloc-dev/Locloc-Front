import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner-layout',
  standalone: true,

  imports: [
    RouterOutlet
  ],

  templateUrl: './owner-layout.html',
  styleUrl: './owner-layout.css',
})
export class OwnerLayout {
  constructor(private router: Router) {}
  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }
}
