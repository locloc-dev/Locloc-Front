import { Component, OnInit, computed, signal } from '@angular/core';

import { PropertyService } from '../../../core/services/property.service';
import { PropertyResponse } from '../../../core/models/property.model';

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

  approvedCount = computed(
    () => this.properties().filter((p) => p.status === 'APPROVED').length,
  );

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.propertyService.getAllProperties(0, 50).subscribe({
      next: (data) => {
        this.properties.set(data.content);
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
}
