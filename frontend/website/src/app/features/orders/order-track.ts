import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/ecommerce.models';

@Component({
  selector: 'app-order-track',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-track.html',
  styleUrl: './order-track.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderTrack implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly order = signal<Order | null>(null);
  readonly isLoading = signal<boolean>(true);

  readonly steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Received & Inventory Allocated', icon: 'fa-file-invoice' },
    { key: 'paid', label: 'Payment Verified', desc: 'Settled via Razorpay / UPI', icon: 'fa-circle-check' },
    { key: 'shipped', label: 'Dispatched & In Transit', desc: 'Air Express Courier Assigned', icon: 'fa-truck-fast' },
    { key: 'delivered', label: 'Delivered', desc: 'Handed to Recipient', icon: 'fa-house-circle-check' }
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const orderId = Number(idParam);
      this.orderService.fetchOrderById(orderId).subscribe({
        next: (res) => {
          this.order.set(res);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.isLoading.set(false);
    }
  }

  isStepCompleted(stepKey: string, currentStatus?: string): boolean {
    if (!currentStatus) return false;
    if (currentStatus === 'cancelled') return false;
    const orderRanks: Record<string, number> = {
      'pending': 1,
      'paid': 2,
      'shipped': 3,
      'delivered': 4
    };
    return (orderRanks[currentStatus] || 0) >= (orderRanks[stepKey] || 0);
  }

  isStepActive(stepKey: string, currentStatus?: string): boolean {
    return currentStatus === stepKey;
  }
}
