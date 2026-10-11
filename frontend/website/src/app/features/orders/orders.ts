import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Orders implements OnInit {
  protected readonly orderService = inject(OrderService);
  protected readonly authService = inject(AuthService);

  protected readonly orders = this.orderService.orders;
  protected readonly isLoading = this.orderService.isLoading;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.orderService.fetchMyOrders().subscribe();
    }
  }
}
