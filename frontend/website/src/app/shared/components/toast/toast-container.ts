import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}">
          <div class="toast__icon">
            @switch (toast.type) {
              @case ('success') { <i class="fa-solid fa-circle-check"></i> }
              @case ('error') { <i class="fa-solid fa-triangle-exclamation"></i> }
              @default { <i class="fa-solid fa-circle-info"></i> }
            }
          </div>
          <p class="toast__message">{{ toast.message }}</p>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)" aria-label="Dismiss toast">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background-color: #0f172a;
      color: #f8fafc;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.7);
      border: 1px solid rgba(255,255,255,0.1);
      font-size: 0.9rem;
      font-weight: 500;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 380px;

      &--success {
        border-color: rgba(16, 185, 129, 0.4);
        .toast__icon { color: #10b981; }
      }
      &--error {
        border-color: rgba(244, 63, 94, 0.4);
        .toast__icon { color: #f43f5e; }
      }
      &--info {
        border-color: rgba(99, 102, 241, 0.4);
        .toast__icon { color: #6366f1; }
      }

      &__icon {
        font-size: 1.15rem;
        flex-shrink: 0;
      }
      &__message {
        flex: 1;
        line-height: 1.4;
      }
      &__close {
        color: #64748b;
        font-size: 0.9rem;
        &:hover { color: #ffffff; }
      }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
}
