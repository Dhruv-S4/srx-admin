import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { ObjectViewer } from '../../shared/components/object-viewer/object-viewer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIcon, ObjectViewer],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
