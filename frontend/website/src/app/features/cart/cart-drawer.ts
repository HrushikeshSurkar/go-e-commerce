import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart-drawer',
  template: `
    <aside class="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      <div class="cart-drawer__overlay" (click)="close.emit()"></div>
      <div class="cart-drawer__panel">
        <!-- Header -->
        <div class="cart-drawer__header">
          <div class="cart-drawer__title-wrap">
            <h3 class="cart-drawer__title">Shopping Bag</h3>
            <span class="cart-drawer__count-badge">{{ cartCount() }} items</span>
          </div>
          <button class="cart-drawer__btn-close" (click)="close.emit()" aria-label="Close cart">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Free Delivery Progress Bar -->
        <div class="cart-drawer__perk-bar">
          <div class="perk-info">
            <i class="fa-solid fa-truck-fast"></i>
            <span>Complimentary Express Insured Delivery Unlocked!</span>
          </div>
          <div class="perk-progress">
            <div class="perk-progress__fill" style="width: 100%"></div>
          </div>
        </div>

        <!-- Body -->
        @if (cartItems().length === 0) {
          <div class="cart-drawer__empty">
            <div class="cart-drawer__empty-icon">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>
            <h4>Your bag is empty</h4>
            <p>Discover flagship headphones, monitors, and studio peripherals to fill your bag.</p>
            <button class="cart-drawer__btn-shop" (click)="close.emit()">
              <i class="fa-solid fa-sparkles"></i>
              <span>Explore Collection</span>
            </button>
          </div>
        } @else {
          <div class="cart-drawer__items">
            @for (item of cartItems(); track item.product.id) {
              <div class="cart-row">
                <img [src]="item.product.image_url" [alt]="item.product.name" class="cart-row__thumb">
                <div class="cart-row__details">
                  <h4 class="cart-row__title">{{ item.product.name }}</h4>
                  <div class="cart-row__price">\${{ item.product.price.toFixed(2) }}</div>
                  
                  <div class="cart-row__actions">
                    <div class="cart-row__stepper">
                      <button
                        class="cart-row__stepper-btn"
                        (click)="productService.updateQuantity(item.product.id, item.quantity - 1)"
                        aria-label="Decrease quantity">
                        <i class="fa-solid fa-minus"></i>
                      </button>
                      <span class="cart-row__stepper-val">{{ item.quantity }}</span>
                      <button
                        class="cart-row__stepper-btn"
                        (click)="productService.updateQuantity(item.product.id, item.quantity + 1)"
                        aria-label="Increase quantity">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                    </div>

                    <button
                      class="cart-row__btn-delete"
                      (click)="productService.removeFromCart(item.product.id)"
                      title="Remove item">
                      <i class="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <div class="cart-row__subtotal">
                  \${{ (item.product.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            }
          </div>

          <!-- Order Summary Footer -->
          <div class="cart-drawer__summary">
            <div class="cart-drawer__summary-row">
              <span>Subtotal</span>
              <span>\${{ cartTotal().toFixed(2) }}</span>
            </div>
            <div class="cart-drawer__summary-row">
              <span>Express Insured Shipping</span>
              <span class="cart-drawer__free-ship">FREE</span>
            </div>
            <div class="cart-drawer__divider"></div>
            <div class="cart-drawer__summary-row cart-drawer__summary-row--total">
              <span>Estimated Total</span>
              <span class="cart-drawer__grand-price">\${{ cartTotal().toFixed(2) }}</span>
            </div>

            <button class="cart-drawer__btn-checkout" (click)="proceedToCheckout()">
              <span>Proceed to Checkout</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>

            <div class="cart-drawer__trust-note">
              <i class="fa-solid fa-shield-halved"></i>
              <span>UPI, Cards, EMI & Razorpay Encrypted Checkout</span>
            </div>
          </div>
        }
      </div>
    </aside>
  `,
  styleUrl: './cart-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartDrawer {
  protected readonly productService = inject(ProductService);
  protected readonly authService = inject(AuthService);
  protected readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly close = output<void>();
  readonly requireAuth = output<void>();

  protected readonly cartItems = this.productService.cart;
  protected readonly cartCount = this.productService.cartCount;
  protected readonly cartTotal = this.productService.cartTotal;

  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      this.toastService.info('Please sign in or create an account to complete checkout.');
      this.requireAuth.emit();
      return;
    }

    this.close.emit();
    this.router.navigate(['/checkout']);
  }
}
