import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product, Category, CartItem, Order } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  // Signals
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly cart = signal<CartItem[]>(this.getStoredCart());
  readonly isLoading = signal<boolean>(false);

  // Derived state (computed)
  readonly cartCount = computed(() =>
    this.cart().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly cartTotal = computed(() =>
    this.cart().reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  );

  constructor(private readonly http: HttpClient) {}

  fetchCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`).pipe(
      tap(cats => this.categories.set(cats))
    );
  }

  fetchProducts(categoryId?: number, search?: string): Observable<Product[]> {
    this.isLoading.set(true);
    let url = `${this.baseUrl}/products`;
    const params: string[] = [];

    if (categoryId) params.push(`category_id=${categoryId}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<Product[]>(url).pipe(
      tap({
        next: prods => {
          this.products.set(prods);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  addToCart(product: Product): void {
    const current = this.cart();
    const existingIndex = current.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1
      };
      this.updateCart(updated);
    } else {
      this.updateCart([...current, { product, quantity: 1 }]);
    }
  }

  removeFromCart(productId: number): void {
    const updated = this.cart().filter(item => item.product.id !== productId);
    this.updateCart(updated);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const updated = this.cart().map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    this.updateCart(updated);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  checkout(): Observable<Order> {
    const items = this.cart().map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));

    return this.http.post<Order>(`${this.baseUrl}/orders`, { items }).pipe(
      tap(() => this.clearCart())
    );
  }

  private updateCart(newCart: CartItem[]): void {
    this.cart.set(newCart);
    localStorage.setItem('ecommerce_cart', JSON.stringify(newCart));
  }

  private getStoredCart(): CartItem[] {
    const stored = localStorage.getItem('ecommerce_cart');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
}
