export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  user_id: number;
  user?: User;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  shipping_address?: string;
  items?: OrderItem[];
  created_at: string;
}

export interface CreateOrderResponse {
  order: Order;
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount_paise: number;
  currency: string;
}

export interface VerifyPaymentInput {
  order_id: number;
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'admin';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: 'customer' | 'admin';
}
