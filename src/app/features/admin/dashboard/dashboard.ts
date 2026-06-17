import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { UserService } from '../../../core/services/user.service';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyResponse } from '../../../core/models/property.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);

  totalUsers = signal(0);
  totalProperties = signal(0);
  approvedCount = signal(0);
  pendingProperties = signal<PropertyResponse[]>([]);

  pendingCount = computed(() => this.pendingProperties().length);

  constructor(
    private userService: UserService,
    private propertyService: PropertyService,
  ) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);

    // Run the 3 calls in parallel, then fill the dashboard
    forkJoin({
      users: this.userService.getAllUsers(),
      all: this.propertyService.getAllProperties(0, 1000),
      pending: this.propertyService.getPendingProperties(),
    }).subscribe({
      next: ({ users, all, pending }) => {
        this.totalUsers.set(users.length);
        this.totalProperties.set(all.totalElements);
        this.approvedCount.set(
          all.content.filter((p) => p.status === 'APPROVED').length,
        );
        this.pendingProperties.set(pending);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi avec un compte ADMIN.'
            : 'Impossible de charger les statistiques. Backend démarré sur :8080 ?',
        );
        this.loading.set(false);
      },
    });
  }
}
