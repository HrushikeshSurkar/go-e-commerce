import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth-dialog',
  imports: [FormsModule],
  template: `
    <div class="auth-modal" role="dialog" aria-modal="true" aria-label="Sign In">
      <div class="auth-modal__overlay" (click)="close.emit()"></div>
      <div class="auth-modal__window">
        <button class="auth-modal__close-btn" (click)="close.emit()" aria-label="Close dialog">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="auth-modal__top">
          <div class="auth-modal__icon-badge">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 class="auth-modal__title">Welcome to Nexus</h2>
          <p class="auth-modal__desc">Access your orders, profile, and express checkout</p>
        </div>

        <!-- Segmented Tabs -->
        <div class="auth-modal__nav">
          <button
            type="button"
            class="auth-modal__nav-item"
            [class.auth-modal__nav-item--active]="authTab() === 'login'"
            (click)="setAuthTab('login')">
            Sign In
          </button>
          <button
            type="button"
            class="auth-modal__nav-item"
            [class.auth-modal__nav-item--active]="authTab() === 'register'"
            (click)="setAuthTab('register')">
            Register
          </button>
          <button
            type="button"
            class="auth-modal__nav-item"
            [class.auth-modal__nav-item--active]="authTab() === 'forgot'"
            (click)="setAuthTab('forgot')">
            Forgot Password
          </button>
        </div>

        <!-- Feedback Notifications -->
        @if (authMessage()) {
          <div class="auth-modal__banner auth-modal__banner--success">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ authMessage() }}</span>
          </div>
        }
        @if (authError()) {
          <div class="auth-modal__banner auth-modal__banner--error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>{{ authError() }}</span>
          </div>
        }

        <!-- Tab 1: Normal Login -->
        @if (authTab() === 'login') {
          <form class="auth-form" (submit)="$event.preventDefault()">
            <div class="auth-form__group">
              <label class="auth-form__label">Email Address</label>
              <input
                type="email"
                class="auth-form__input"
                [ngModel]="authEmail()"
                (ngModelChange)="authEmail.set($event)"
                placeholder="customer@ecommerce.com">
            </div>

            <div class="auth-form__group">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="auth-form__label">Password</label>
                <button type="button" class="auth-form__btn-text" (click)="setAuthTab('forgot')">Forgot Password?</button>
              </div>
              <input
                type="password"
                class="auth-form__input"
                [ngModel]="authPassword()"
                (ngModelChange)="authPassword.set($event)"
                placeholder="••••••••">
            </div>

            <button
              type="button"
              class="auth-form__btn-primary"
              [disabled]="isAuthSubmitting()"
              (click)="submitLogin()">
              {{ isAuthSubmitting() ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>
        }

        <!-- Tab 2: Normal Register -->
        @if (authTab() === 'register') {
          <form class="auth-form" (submit)="$event.preventDefault()">
            <div class="auth-form__group">
              <label class="auth-form__label">Full Name</label>
              <input
                type="text"
                class="auth-form__input"
                [ngModel]="authName()"
                (ngModelChange)="authName.set($event)"
                placeholder="Alex Rivers">
            </div>

            <div class="auth-form__group">
              <label class="auth-form__label">Email Address</label>
              <input
                type="email"
                class="auth-form__input"
                [ngModel]="authEmail()"
                (ngModelChange)="authEmail.set($event)"
                placeholder="alex@company.com">
            </div>

            <div class="auth-form__group">
              <label class="auth-form__label">Password</label>
              <input
                type="password"
                class="auth-form__input"
                [ngModel]="authPassword()"
                (ngModelChange)="authPassword.set($event)"
                placeholder="Minimum 6 characters">
            </div>

            <button
              type="button"
              class="auth-form__btn-primary"
              [disabled]="isAuthSubmitting()"
              (click)="submitRegister()">
              {{ isAuthSubmitting() ? 'Creating Profile...' : 'Complete Registration' }}
            </button>
          </form>
        }

        <!-- Tab 3: Forgot Password with Real Email OTP -->
        @if (authTab() === 'forgot') {
          <form class="auth-form" (submit)="$event.preventDefault()">
            <div class="auth-form__group">
              <label class="auth-form__label">Account Email Address</label>
              <input
                type="email"
                class="auth-form__input"
                [ngModel]="authEmail()"
                (ngModelChange)="authEmail.set($event)"
                placeholder="e.g. hrushikeshsurkar@gmail.com"
                [disabled]="otpDispatched() || isAuthSubmitting()">
            </div>

            @if (!otpDispatched()) {
              <button
                type="button"
                class="auth-form__btn-primary"
                [disabled]="isAuthSubmitting()"
                (click)="requestForgotPasswordOtp()">
                {{ isAuthSubmitting() ? 'Sending Email...' : 'Send Recovery OTP to Email' }}
              </button>
            } @else {
              <div class="auth-form__group">
                <label class="auth-form__label">Enter 6-Digit Email OTP</label>
                <input
                  type="text"
                  class="auth-form__input auth-form__input--code"
                  maxlength="6"
                  [ngModel]="authOtpCode()"
                  (ngModelChange)="authOtpCode.set($event)"
                  placeholder="• • • • • •">
              </div>

              <div class="auth-form__group">
                <label class="auth-form__label">Enter New Password</label>
                <input
                  type="password"
                  class="auth-form__input"
                  [ngModel]="authNewPassword()"
                  (ngModelChange)="authNewPassword.set($event)"
                  placeholder="New password (min 6 characters)">
              </div>

              <button
                type="button"
                class="auth-form__btn-primary"
                [disabled]="isAuthSubmitting()"
                (click)="submitResetPassword()">
                {{ isAuthSubmitting() ? 'Resetting Password...' : 'Reset Password & Proceed' }}
              </button>

              <button
                type="button"
                class="auth-form__btn-text"
                (click)="otpDispatched.set(false); requestForgotPasswordOtp()">
                Did not receive email? Resend code
              </button>
            }
          </form>
        }
      </div>
    </div>
  `,
  styleUrl: './auth-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthDialog {
  protected readonly authService = inject(AuthService);
  protected readonly toastService = inject(ToastService);

  readonly close = output<void>();

  protected readonly authTab = signal<'login' | 'register' | 'forgot'>('login');
  protected readonly authEmail = signal<string>('customer@ecommerce.com');
  protected readonly authPassword = signal<string>('Customer@123');
  protected readonly authName = signal<string>('');
  protected readonly authOtpCode = signal<string>('');
  protected readonly authNewPassword = signal<string>('');
  protected readonly otpDispatched = signal<boolean>(false);
  protected readonly authMessage = signal<string>('');
  protected readonly authError = signal<string>('');
  protected readonly isAuthSubmitting = signal<boolean>(false);

  setAuthTab(tab: 'login' | 'register' | 'forgot'): void {
    this.authTab.set(tab);
    this.authMessage.set('');
    this.authError.set('');
    this.otpDispatched.set(false);
  }

  submitLogin(): void {
    if (!this.authEmail() || !this.authPassword()) {
      this.authError.set('Please provide both email and password.');
      return;
    }

    this.isAuthSubmitting.set(true);
    this.authError.set('');

    this.authService.login({
      email: this.authEmail(),
      password: this.authPassword()
    }).subscribe({
      next: (res) => {
        this.isAuthSubmitting.set(false);
        this.toastService.success(`Welcome back, ${res.user.name}!`);
        this.close.emit();
      },
      error: (err) => {
        this.isAuthSubmitting.set(false);
        this.authError.set(err.error?.error || 'Invalid credentials');
        this.toastService.error('Sign in failed. Check your credentials.');
      }
    });
  }

  submitRegister(): void {
    if (!this.authName() || !this.authEmail() || !this.authPassword()) {
      this.authError.set('Please fill out all registration fields.');
      return;
    }

    this.isAuthSubmitting.set(true);
    this.authError.set('');

    this.authService.register({
      name: this.authName(),
      email: this.authEmail(),
      password: this.authPassword()
    }).subscribe({
      next: () => {
        this.isAuthSubmitting.set(false);
        this.toastService.success('Account created successfully! Welcome to Nexus.');
        this.close.emit();
      },
      error: (err) => {
        this.isAuthSubmitting.set(false);
        this.authError.set(err.error?.error || 'Registration failed');
        this.toastService.error('Could not create account.');
      }
    });
  }

  requestForgotPasswordOtp(): void {
    if (!this.authEmail()) {
      this.authError.set('Please enter your email address to receive the recovery code.');
      return;
    }

    this.isAuthSubmitting.set(true);
    this.authError.set('');
    this.authMessage.set('');

    this.authService.requestForgotPassword(this.authEmail()).subscribe({
      next: () => {
        this.isAuthSubmitting.set(false);
        this.otpDispatched.set(true);
        this.authMessage.set('A 6-digit recovery OTP has been sent to your email inbox.');
        this.toastService.info('Verification code sent to your email.');
      },
      error: (err) => {
        this.isAuthSubmitting.set(false);
        this.authError.set(err.error?.error || 'Failed to dispatch recovery email.');
        this.toastService.error('Email delivery failed. Please check the email.');
      }
    });
  }

  submitResetPassword(): void {
    if (!this.authOtpCode() || !this.authNewPassword()) {
      this.authError.set('Please enter both the 6-digit code and your new password.');
      return;
    }

    this.isAuthSubmitting.set(true);
    this.authError.set('');

    this.authService.resetPassword({
      email: this.authEmail(),
      code: this.authOtpCode(),
      new_password: this.authNewPassword()
    }).subscribe({
      next: (res) => {
        this.isAuthSubmitting.set(false);
        this.authMessage.set(res.message);
        this.authTab.set('login');
        this.otpDispatched.set(false);
        this.authPassword.set(this.authNewPassword());
        this.toastService.success('Password successfully reset! Please sign in.');
      },
      error: (err) => {
        this.isAuthSubmitting.set(false);
        this.authError.set(err.error?.error || 'Invalid or expired OTP code.');
        this.toastService.error('Invalid OTP verification code.');
      }
    });
  }
}
