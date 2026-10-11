import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User, Order } from '../../core/models/ecommerce.models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboard implements OnInit {
  protected readonly userService = inject(UserService);
  protected readonly orderService = inject(OrderService);
  protected readonly authService = inject(AuthService);
  protected readonly toastService = inject(ToastService);

  readonly currentTab = signal<'users' | 'orders'>('users');
  readonly users = this.userService.users;
  readonly allOrders = this.orderService.allOrders;
  readonly isUsersLoading = this.userService.isLoading;
  readonly isOrdersLoading = this.orderService.isLoading;

  // User modal / form state
  readonly isUserModalOpen = signal<boolean>(false);
  readonly editingUser = signal<User | null>(null);
  readonly formName = signal<string>('');
  readonly formEmail = signal<string>('');
  readonly formRole = signal<'customer' | 'admin'>('customer');
  readonly formPassword = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.loadUsers();
      this.loadOrders();
    }
  }

  loadUsers(): void {
    this.userService.fetchUsers().subscribe();
  }

  loadOrders(): void {
    this.orderService.fetchAllOrders().subscribe();
  }

  openCreateUser(): void {
    this.editingUser.set(null);
    this.formName.set('');
    this.formEmail.set('');
    this.formRole.set('customer');
    this.formPassword.set('');
    this.isUserModalOpen.set(true);
  }

  openEditUser(user: User): void {
    this.editingUser.set(user);
    this.formName.set(user.name);
    this.formEmail.set(user.email);
    this.formRole.set(user.role);
    this.formPassword.set('');
    this.isUserModalOpen.set(true);
  }

  closeUserModal(): void {
    this.isUserModalOpen.set(false);
  }

  saveUser(): void {
    if (!this.formName() || !this.formEmail()) {
      this.toastService.error('Name and email are required');
      return;
    }

    this.isSubmitting.set(true);
    const editing = this.editingUser();

    if (editing) {
      // Update
      this.userService.updateUser(editing.id, {
        name: this.formName(),
        email: this.formEmail(),
        role: this.formRole(),
        password: this.formPassword() || undefined
      }).subscribe({
        next: () => {
          this.toastService.success(`User #${editing.id} updated successfully`);
          this.isSubmitting.set(false);
          this.isUserModalOpen.set(false);
        },
        error: (err) => {
          this.toastService.error(err.error?.error || 'Failed to update user');
          this.isSubmitting.set(false);
        }
      });
    } else {
      // Create
      if (!this.formPassword()) {
        this.toastService.error('Password is required for new users');
        this.isSubmitting.set(false);
        return;
      }

      this.userService.createUser({
        name: this.formName(),
        email: this.formEmail(),
        role: this.formRole(),
        password: this.formPassword()
      }).subscribe({
        next: () => {
          this.toastService.success('User account registered successfully');
          this.isSubmitting.set(false);
          this.isUserModalOpen.set(false);
        },
        error: (err) => {
          this.toastService.error(err.error?.error || 'Failed to create user');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.name} (${user.email})?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.toastService.success(`User ${user.name} deleted`);
        },
        error: (err) => {
          this.toastService.error(err.error?.error || 'Could not delete user');
        }
      });
    }
  }

  updateOrderStatus(order: Order, newStatus: Order['status']): void {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.toastService.success(`Order #${order.id} status changed to ${newStatus}`);
      },
      error: (err) => {
        this.toastService.error(err.error?.error || 'Could not update order status');
      }
    });
  }
}
