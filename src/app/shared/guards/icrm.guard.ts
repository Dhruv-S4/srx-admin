
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SrUserSessionService } from '../services/user-session.service';
import { ToastService } from '../services/toast.service';

function hasKey(key: any): boolean {
    const lsValue =
        new URLSearchParams(window.location.search).get('token') || localStorage.getItem(key) || '';
    if (lsValue === '') {
        return false;
    }
    localStorage.setItem('satellizer_token', lsValue);
    return !!lsValue;
}

function handleLogout(router: Router): void {
    window.parent.postMessage({ source: 'icrmIframe', value: 'logout' }, '*');
    localStorage.removeItem('ngStorage-USER');
    localStorage.removeItem('satellizer_token');
    router.navigate(['/logout']);
}

function validateTokenAndGetUserData(): Promise<boolean> {
    return new Promise(async (resolve) => {
        const userSession = inject(SrUserSessionService);
        const toast = inject(ToastService);
        const router = inject(Router);
        const token =
            new URLSearchParams(window.location.search).get('token') ||
            localStorage.getItem('satellizer_token');

        if (!token) {
            handleLogout(router);
            resolve(false);
            return;
        }

        // Store token in localStorage if it came from URL
        if (new URLSearchParams(window.location.search).get('token')) {
            localStorage.setItem('satellizer_token', token);
        }

        try {
            const resp = await userSession.getUser();
            localStorage.setItem('ngStorage-USER', JSON.stringify(resp));
            // --- Begin isAdmin logic from external icrm.guard.ts ---
            const user = resp;
            const isAdmin = user ? user.role_type : '';
            const cond1 =
                typeof isAdmin === 'string' &&
                (isAdmin === 'admin' || isAdmin === 'support' || isAdmin === 'logistics');
            const cond2 =
                Array.isArray(isAdmin) &&
                (isAdmin.includes('admin') || isAdmin.includes('support') || isAdmin.includes('logistics'));
            const isTokenAvailable = !!token;

            if ((cond1 || cond2) && isTokenAvailable) {
                // Remove token from URL if it exists
                const url = new URL(window.location.href);
                if (url.searchParams.has('token')) {
                    url.searchParams.delete('token');
                    window.location.href = url.toString();
                }
                resolve(true);
                return;
            }
            handleLogout(router);
            resolve(false);
            // --- End isAdmin logic ---
        } catch (err: any) {
            handleLogout(router);
            if (err?.message?.includes('Please Reset the Password')) {
                toast.error('Please Reset the Password');
                window.location.href = '/recovery?isPasswordReset=1';
                resolve(false);
                return;
            }
            resolve(false);
        }
    });
}

export const icrmGuard: CanActivateFn = async (route, state) => {
    const router = inject(Router);
    const isTokenAvailable = hasKey('satellizer_token');
    const isUserDataAvailable = !!localStorage.getItem('ngStorage-USER');

    if (!isTokenAvailable && !isUserDataAvailable) {
        handleLogout(router);
        return false;
    }

    return await validateTokenAndGetUserData();
};
