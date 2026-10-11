import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Order, CreateOrderResponse, VerifyPaymentInput } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/orders';

  readonly orders = signal<Order[]>([]);
  readonly allOrders = signal<Order[]>([]);
  readonly currentTrackedOrder = signal<Order | null>(null);
  readonly isLoading = signal<boolean>(false);

  fetchMyOrders(): Observable<Order[]> {
    this.isLoading.set(true);
    return this.http.get<Order[]>(`${this.baseUrl}/my-orders`).pipe(
      tap({
        next: (orders) => {
          this.orders.set(orders);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  fetchOrderById(id: number): Observable<Order> {
    this.isLoading.set(true);
    return this.http.get<Order>(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: (order) => {
          this.currentTrackedOrder.set(order);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  createOrder(payload: { items: { product_id: number; quantity: number }[]; payment_method: string; shipping_address: string }): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.baseUrl, payload);
  }

  verifyPayment(input: VerifyPaymentInput): Observable<{ message: string; order: Order }> {
    return this.http.post<{ message: string; order: Order }>(`${this.baseUrl}/verify-payment`, input).pipe(
      tap((res) => {
        this.currentTrackedOrder.set(res.order);
      })
    );
  }

  fetchAllOrders(): Observable<Order[]> {
    this.isLoading.set(true);
    return this.http.get<Order[]>(this.baseUrl).pipe(
      tap({
        next: (orders) => {
          this.allOrders.set(orders);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  updateOrderStatus(orderId: number, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${orderId}/status`, { status }).pipe(
      tap((updated) => {
        this.allOrders.update(orders =>
          orders.map(o => o.id === orderId ? { ...o, status: updated.status } : o)
        );
      })
    );
  }
}
