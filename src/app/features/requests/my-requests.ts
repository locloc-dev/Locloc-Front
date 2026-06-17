import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { RequestService } from '../../core/services/request.service';
import { RequestResponse } from '../../core/models/request.model';

@Component({
  selector: 'app-my-requests',
  imports: [],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequests implements OnInit {
  requests = signal<RequestResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.requestService.getMyRequests(0, 50).subscribe({
      next: (page) => {
        this.requests.set(page.content);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err?.status === 403
            ? 'Accès refusé : connecte-toi en TENANT.'
            : 'Impossible de charger vos demandes. Backend démarré sur :8080 ?',
        );
        this.loading.set(false);
      },
    });
  }

  typeLabel(type: string): string {
    return type === 'VISIT' ? 'Visite' : type === 'RENT' ? 'Location' : 'Achat';
  }
}
