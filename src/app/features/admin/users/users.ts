import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../../../core/services/user.service';
import { Role, ROLES, UserResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  readonly roles = ROLES;

  users = signal<UserResponse[]>([]);
  search = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  filtered = computed(() => {
    const term = this.search().toLowerCase().trim();

    if (!term) {
      return this.users();
    }

    return this.users().filter(
      (u) =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  });

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi avec un compte ADMIN.'
            : 'Impossible de charger les utilisateurs. Backend démarré sur :8080 ?',
        );
        this.loading.set(false);
      },
    });
  }

  onRoleChange(user: UserResponse, role: Role): void {
    this.userService.changeRole(user.id, role).subscribe({
      next: (updated) => this.replace(updated),
      error: () => this.error.set('Échec du changement de rôle.'),
    });
  }

  toggleStatus(user: UserResponse): void {
    const request$ = user.enabled
      ? this.userService.disableUser(user.id)
      : this.userService.enableUser(user.id);

    request$.subscribe({
      next: (updated) => this.replace(updated),
      error: () => this.error.set('Échec de la mise à jour du statut.'),
    });
  }

  remove(user: UserResponse): void {
    if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () =>
        this.users.update((list) => list.filter((u) => u.id !== user.id)),
      error: () => this.error.set('Échec de la suppression.'),
    });
  }

  private replace(updated: UserResponse): void {
    this.users.update((list) =>
      list.map((u) => (u.id === updated.id ? updated : u)),
    );
  }
}
