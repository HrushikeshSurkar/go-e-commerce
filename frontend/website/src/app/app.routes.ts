import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout)
  },
  {
    path: 'order-success/:id',
    loadComponent: () => import('./features/checkout/order-success').then(m => m.OrderSuccess)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders').then(m => m.Orders)
  },
  {
    path: 'orders/track/:id',
    loadComponent: () => import('./features/orders/order-track').then(m => m.OrderTrack)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard').then(m => m.AdminDashboard)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
