import { Component, OnInit, computed, signal } from '@angular/core';

import { PropertyService } from '../../../core/services/property.service';
import { PropertyResponse } from '../../../core/models/property.model';

type Filter = 'ALL' | 'PENDING';

@Component({
  selector: 'app-admin-properties',
  imports: [],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class Properties implements OnInit {
  properties = signal<PropertyResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  filter = signal<Filter>('ALL');

  approvedCount = computed(
    () => this.properties().filter((p) => p.status === 'APPROVED').length,
  );
  pendingCount = computed(
    () => this.properties().filter((p) => p.status === 'PENDING').length,
  );
  rejectedCount = computed(
    () => this.properties().filter((p) => p.status === 'REJECTED').length,
  );

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.load();
  }

  setFilter(filter: Filter): void {
    this.filter.set(filter);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const request$ =
      this.filter() === 'PENDING'
        ? this.propertyService.getPendingProperties()
        : this.propertyService.getAllProperties(0, 50);

// @ts-ignore
    request$.subscribe({
      next: (data: { content: any }) => {
        // getAllProperties returns a Page, getPending returns an array
        const list = Array.isArray(data) ? data : data.content;
        this.properties.set(list);
        this.loading.set(false);
      },
      error: (err: { status: number }) => {
        this.error.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi avec un compte ADMIN.'
            : 'Impossible de charger les propriétés. Backend démarré sur :8080 ?',
        );
        this.loading.set(false);
      },
    });
  }

  approve(prop: PropertyResponse): void {
    this.propertyService.approveProperty(prop.id).subscribe({
      next: (updated) => this.replace(updated),
      error: () => this.error.set('Échec de l’approbation.'),
    });
  }

  reject(prop: PropertyResponse): void {
    this.propertyService.rejectProperty(prop.id).subscribe({
      next: (updated) => this.replace(updated),
      error: () => this.error.set('Échec du rejet.'),
    });
  }

  /** Update the row in place, or drop it when we are on the Pending filter */
  private replace(updated: PropertyResponse): void {
    if (this.filter() === 'PENDING') {
      this.properties.update((list) => list.filter((p) => p.id !== updated.id));
      return;
    }

    this.properties.update((list) =>
      list.map((p) => (p.id === updated.id ? updated : p)),
    );
  }
}
