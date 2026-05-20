import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,

  imports: [RouterOutlet],

  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  constructor(private router: Router) {}

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }
}
