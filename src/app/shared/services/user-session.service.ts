import { Injectable, inject } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SrUserSessionService {
    private userPromise: Promise<any> | null = null;
    router = inject(Router);
    authService = inject(AuthService);

    constructor() {
        this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
            this.userPromise = null;
        });
    }

    getUser(): Promise<any> {
        if (!this.userPromise) {
            this.userPromise = firstValueFrom(this.authService.getUser({}));
        }
        return this.userPromise;
    }
}
