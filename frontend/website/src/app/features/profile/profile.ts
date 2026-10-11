import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Profile implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly toastService = inject(ToastService);

  readonly user = this.authService.currentUser;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.fetchProfile().subscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('You have signed out of your account.');
  }
}
