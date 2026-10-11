import { ChangeDetectionStrategy, Component, inject, output, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, UpperCasePipe, FormsModule],
  template: `
    <header class="navbar">
      <div class="navbar__container">
        <a class="navbar__brand" routerLink="/">
          <div class="navbar__logo-gem">
            <i class="fa-solid fa-bolt"></i>
          </div>
          <span class="navbar__brand-title">NEXUS<span class="navbar__brand-dot">.</span>GO</span>
        </a>

        <!-- Live Search -->
        <div class="navbar__search">
          <i class="fa-solid fa-magnifying-glass navbar__search-icon"></i>
          <input
            type="text"
            class="navbar__search-input"
            placeholder="Search electronics, apparel, workspace..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)">
          @if (searchQuery()) {
            <button class="navbar__search-clear" (click)="clearSearch()" aria-label="Clear search">
              <i class="fa-solid fa-xmark"></i>
            </button>
          }
        </div>

        <!-- Navigation Links -->
        <nav class="navbar__nav-links">
          <a routerLink="/" class="navbar__nav-item" routerLinkActive="navbar__nav-item--active" [routerLinkActiveOptions]="{exact: true}">
            <i class="fa-solid fa-store"></i>
            <span>Catalog</span>
          </a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/orders" class="navbar__nav-item" routerLinkActive="navbar__nav-item--active">
              <i class="fa-solid fa-box-open"></i>
              <span>My Orders</span>
            </a>
            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="navbar__nav-item navbar__nav-item--admin" routerLinkActive="navbar__nav-item--active">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Admin Operations</span>
              </a>
            }
          }
        </nav>

        <!-- Actions -->
        <div class="navbar__actions">
          <!-- Dark / Light Mode Switcher -->
          <button
            class="navbar__theme-toggle"
            (click)="themeService.toggleTheme()"
            [title]="themeService.currentTheme() === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            aria-label="Toggle Dark and Light theme">
            @if (themeService.currentTheme() === 'dark') {
              <i class="fa-solid fa-sun navbar__theme-sun"></i>
            } @else {
              <i class="fa-solid fa-moon navbar__theme-moon"></i>
            }
          </button>

          <button class="navbar__cart-btn" (click)="openCart.emit()" aria-label="Open Cart">
            <div class="navbar__cart-icon-wrap">
              <i class="fa-solid fa-bag-shopping"></i>
              @if (cartCount() > 0) {
                <span class="navbar__cart-badge">{{ cartCount() }}</span>
              }
            </div>
            <div class="navbar__cart-meta">
              <span class="navbar__cart-label">Cart</span>
              <span class="navbar__cart-total">\${{ cartTotal().toFixed(2) }}</span>
            </div>
          </button>

          @if (authService.isAuthenticated()) {
            <div class="navbar__profile">
              <a routerLink="/profile" class="navbar__profile-link" title="View Profile">
                <div class="navbar__avatar">
                  {{ (authService.currentUser()?.name || 'U')[0].toUpperCase() }}
                </div>
                <div class="navbar__user-details">
                  <span class="navbar__user-name">{{ authService.currentUser()?.name }}</span>
                  <span class="navbar__user-role">{{ authService.currentUser()?.role | uppercase }}</span>
                </div>
              </a>
              <button class="navbar__btn-logout" (click)="authService.logout()" title="Sign Out">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          } @else {
            <button class="navbar__btn-signin" (click)="openAuthModal.emit()">
              <i class="fa-solid fa-user"></i>
              <span>Sign In</span>
            </button>
          }
        </div>
      </div>
    </header>
  `,
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  protected readonly productService = inject(ProductService);
  protected readonly themeService = inject(ThemeService);

  readonly searchQuery = model<string>('');
  readonly openAuthModal = output<void>();
  readonly openCart = output<void>();

  protected readonly cartCount = this.productService.cartCount;
  protected readonly cartTotal = this.productService.cartTotal;

  clearSearch(): void {
    this.searchQuery.set('');
  }
}
