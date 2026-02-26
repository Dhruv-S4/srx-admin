import { Component, ViewEncapsulation } from '@angular/core';
import { USER_DATA } from '../../core/models/common.model';

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Welcome {
  firstName = USER_DATA?.first_name || 'there';
  greeting = this.getGreeting();

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 16) return 'Good afternoon';
    return 'Good evening';
  }
}
