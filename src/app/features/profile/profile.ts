import { Component } from '@angular/core';
import { USER_DATA } from '../../core/models/common.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styles: ``,
})
export class Profile {
  readonly userData = USER_DATA;
  readonly roles = this.userData?.role_type
    .map((role: any) => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase())
    .join(', ');

  getInitials(): string {
    const first = this.userData?.first_name?.charAt(0) || '';
    const last = this.userData?.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  }
}
