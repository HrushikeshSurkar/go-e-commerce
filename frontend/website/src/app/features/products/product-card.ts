import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../core/models/ecommerce.models';

@Component({
  selector: 'app-product-card',
  template: `
    <article class="card">
      <div class="card__media">
        <img
          class="card__img"
          [src]="product().image_url"
          [alt]="product().name"
          loading="lazy">
        <span class="card__category-badge">
          {{ product().category?.name || 'Curated' }}
        </span>
        <span class="card__stock-pill" [class.card__stock-pill--low]="product().stock < 30">
          {{ product().stock }} units left
        </span>
      </div>

      <div class="card__content">
        <h3 class="card__title">{{ product().name }}</h3>
        <p class="card__desc">{{ product().description }}</p>

        <div class="card__footer">
          <div class="card__price-box">
            <span class="card__price-currency">$</span>
            <span class="card__price-amount">{{ product().price.toFixed(2) }}</span>
          </div>

          <button class="card__btn-add" (click)="add.emit(product())" aria-label="Add to cart">
            <i class="fa-solid fa-plus"></i>
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  `,
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly add = output<Product>();
}
