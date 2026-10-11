import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductCard } from '../products/product-card';
import { Product } from '../../core/models/ecommerce.models';

@Component({
  selector: 'app-home',
  imports: [ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit {
  protected readonly productService = inject(ProductService);
  protected readonly toastService = inject(ToastService);

  protected readonly selectedCategory = signal<number | null>(null);
  protected readonly products = this.productService.products;
  protected readonly categories = this.productService.categories;
  protected readonly isLoading = this.productService.isLoading;

  ngOnInit(): void {
    this.productService.fetchCategories().subscribe();
    this.productService.fetchProducts().subscribe();
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.productService.fetchProducts(categoryId ?? undefined).subscribe();
  }

  onAddToCart(product: Product): void {
    this.productService.addToCart(product);
    this.toastService.success(`"${product.name}" added to your bag!`);
  }
}
