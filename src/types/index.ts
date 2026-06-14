/**
 * CORE TYPES & INTERFACES
 *
 * Shared across the entire app (Global Types)
 */

// --- Seller Related ---
export interface Seller {
  profileId?: string;
  userId: string;
  name: string;
  phone: string;
  imageUrl?: string | null;
  photoUrl?: string | null;
  sellerRatingAvg: string;
  sellerRatingCount: number;
}

// --- User Related ---
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profilePhoto?: string | null;
  isAdmin?: boolean;
  createdAt?: string;
  isSeller?: boolean;
  updatedAt?: string;
}

// --- Auth Related ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  user?: User;
}

export interface RegisterRequest extends Partial<User> {
  password?: string;
}

// --- Listing Related ---
export type PriceType = 'fixed' | 'hourly' | 'daily';

export interface Listing {
  id: string;
  title: string;
  name?: string; // Alias for title
  description: string;
  priceAmount: string; // From API it's usually a string "100.00"
  priceType: PriceType;
  isNegotiable: boolean;
  serviceLocation: string;
  serviceRadiusKm: number;
  imageUrl: string | null;
  photoUrl?: string | null; // Alias for imageUrl
  categoryName?: string;
  categoryId?: string;
  cityName?: string;
  cityId?: string;
  seller?: Seller;
  status?: 'active' | 'paused' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

// --- Notification Related ---
export type NotificationType =
  | 'review_received'
  | 'buyer_marked_completed'
  | 'order_requested'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
  listingId?: string | null;
}

// --- Review Related ---
export interface Review {
  id: string;
  rating: number;
  note: string; // Backend uses 'note'
  comment?: string; // Some frontend components might still use 'comment'
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
  reviewerName?: string;
  reviewerPhotoUrl?: string | null;
  serviceTitle?: string;
  categoryName?: string;
  serviceImageUrl?: string;
  orderId?: string;
}

// --- Category Related ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  parentId?: string | null;
  children?: Category[];
  serviceCount?: number;
}

// --- City Related ---
export interface City {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  listingCount?: number;
}

// --- Order Related ---
export type OrderStatus = 'requested' | 'accepted' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  listingId: string;
  listingTitle?: string;
  listingImageUrl?: string | null;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  priceAmount: string;
  proposedPrice?: string;
  notes?: string;
  sellerCompletedAt?: string | null;
  buyerCompletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  listingId: string;
  proposedPrice: number;
  notes?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  agreedPrice?: number;
  notes?: string;
  sellerCompletedAt?: string;
  buyerCompletedAt?: string;
}

// --- Profile Related ---
export interface UserLocation {
  cityId?: string;
  cityName?: string;
  latitude: number;
  longitude: number;
}

export interface Profile {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  image?: string | null;
  photoUrl?: string | null;
  avgRating?: string;
  reviewsCount?: number;
  completedordercount?: number;
  sellerStatus?: 'none' | 'active' | 'suspended';
  sellerCompletedOrdersCount?: number;
  sellerRatingCount?: number;
  totalServices?: number;
  createdAt?: string;
  updatedAt?: string;
  location?: UserLocation;
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  count: number;
  results?: T[];
  items?: T[]; // Some endpoints use items instead of results
  orders?: T[]; // Some endpoints use orders instead of results
  next?: string | null;
  previous?: string | null;
}

// For endpoints that return raw items or data field
export interface RawApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}
