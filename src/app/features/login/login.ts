import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIcon],
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
