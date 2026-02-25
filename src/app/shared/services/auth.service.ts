import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    http = inject(HttpService);

    loginUser(data: any): Observable<any> {
        return this.http.post('auth/login', data);
    }

    getUser(data: any): Observable<any> {
        return this.http.post('auth/login/user', data);
    }

    sendOtp(data: any, id: any): Observable<any> {
        return this.http.post(`auth/${id}/otp/send`, data);
    }

    reSendOtp(data: any, id: any): Observable<any> {
        return this.http.get(`auth/${id}/otp/resend`, data);
    }

    verifyOtp(data: any, id: any): Observable<any> {
        return this.http.post(`users/${id}/confirm/otp`, data);
    }

    refreshToken(data: any): Observable<any> {
        return this.http.post('external/auth/refresh-token', data);
    }
}
