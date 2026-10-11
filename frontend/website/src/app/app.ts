import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { ToastContainer } from './shared/components/toast/toast-container';
import { CartDrawer } from './features/cart/cart-drawer';
import { AuthDialog } from './features/auth/auth-dialog';
import { ProductService } from './core/services/product.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastContainer, CartDrawer, AuthDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly productService = inject(ProductService);

  readonly isCartOpen = signal<boolean>(false);
  readonly isAuthModalOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.productService.fetchProducts(undefined, query || undefined).subscribe();
  }
}
