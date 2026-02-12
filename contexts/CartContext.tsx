'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Types
export interface CartItem {
  id: string;
  cartItemId?: string; // DB cart item ID (only for logged-in users)
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  landmark?: string;
  provinceRegion: string;
  city: string;
  zone: string;
  address: string;
  type: 'home' | 'office';
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'gpay' | 'card';
  name: string;
  icon?: string;
  details?: string;
}

interface CartContextType {
  // Cart items
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Cart calculations
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;

  // Promo code
  promoCode: string;
  setPromoCode: (code: string) => void;
  applyPromoCode: () => void;
  discount: number;

  // Addresses
  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;

  // Payment
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;

  // Loading state
  cartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Cart state
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Payment state
  const paymentMethods: PaymentMethod[] = [
    { id: '1', type: 'cod', name: 'Cash on Delivery', icon: '💵' },
    { id: '2', type: 'bkash', name: 'bKash', icon: '💳' },
    { id: '3', type: 'nagad', name: 'Nagad', icon: '💰' },
    { id: '4', type: 'rocket', name: 'Rocket', icon: '🚀' },
    { id: '5', type: 'gpay', name: 'GPay', icon: '📱' },
    { id: '6', type: 'card', name: 'Credit/Debit Card', icon: '💳' }
  ];
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(paymentMethods[0]);

  // Cart calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 0; // Free shipping
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shippingCost + tax - discount;

  // ─── DB helpers ───────────────────────────────────────────────

  const fetchCartFromDB = useCallback(async () => {
    setCartLoading(true);
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
      // Sync to localStorage as cache
      localStorage.setItem('minsah_cart', JSON.stringify(data.items ?? []));
    } catch {
      // Network error — fall back to localStorage
      try {
        const saved = localStorage.getItem('minsah_cart');
        if (saved) setItems(JSON.parse(saved));
      } catch { /* ignore */ }
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Merge guest localStorage cart into DB on login
  const mergeGuestCartToDB = useCallback(async (guestItems: CartItem[]) => {
    for (const item of guestItems) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
        });
      } catch { /* ignore individual failures */ }
    }
  }, []);

  // ─── Load cart on mount / user change ─────────────────────────

  useEffect(() => {
    if (user) {
      // Logged-in: check if there's a guest cart to merge first
      const guestCart = (() => {
        try {
          const saved = localStorage.getItem('minsah_cart');
          return saved ? (JSON.parse(saved) as CartItem[]) : [];
        } catch { return []; }
      })();

      const init = async () => {
        if (guestCart.length > 0) {
          await mergeGuestCartToDB(guestCart);
          localStorage.removeItem('minsah_cart');
        }
        await fetchCartFromDB();
      };
      init();
    } else {
      // Guest: load from localStorage
      try {
        const saved = localStorage.getItem('minsah_cart');
        if (saved) setItems(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load addresses from localStorage (addresses still localStorage for now)
  useEffect(() => {
    try {
      const savedAddresses = localStorage.getItem('minsah_addresses');
      if (savedAddresses) {
        const parsed: Address[] = JSON.parse(savedAddresses);
        setAddresses(parsed);
        const def = parsed.find(a => a.isDefault) || parsed[0] || null;
        setSelectedAddress(def);
      }
    } catch { /* ignore */ }
  }, []);

  // Save addresses to localStorage on change
  useEffect(() => {
    localStorage.setItem('minsah_addresses', JSON.stringify(addresses));
  }, [addresses]);

  // ─── Cart functions ────────────────────────────────────────────

  const addItem = useCallback(async (item: CartItem) => {
    if (user) {
      // Optimistic update
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }
        return [...prev, item];
      });

      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
        });
        // Re-fetch to get cartItemId from DB
        await fetchCartFromDB();
      } catch {
        // Keep optimistic state on network error
      }
    } else {
      // Guest: localStorage only
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }
        return [...prev, item];
      });
    }
  }, [user, fetchCartFromDB]);

  const removeItem = useCallback(async (itemId: string) => {
    if (user) {
      const target = items.find(i => i.id === itemId);
      // Optimistic update
      setItems(prev => prev.filter(i => i.id !== itemId));

      if (target?.cartItemId) {
        try {
          await fetch(`/api/cart/${target.cartItemId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch {
          // Restore on failure
          await fetchCartFromDB();
        }
      }
    } else {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  }, [user, items, fetchCartFromDB]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    if (user) {
      const target = items.find(i => i.id === itemId);
      // Optimistic update
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));

      if (target?.cartItemId) {
        try {
          await fetch(`/api/cart/${target.cartItemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ quantity }),
          });
        } catch {
          // Restore on failure
          await fetchCartFromDB();
        }
      }
    } else {
      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      ));
    }
  }, [user, items, removeItem, fetchCartFromDB]);

  const clearCart = useCallback(async () => {
    setItems([]);
    setPromoCode('');
    setDiscount(0);

    if (user) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch { /* ignore */ }
    } else {
      localStorage.setItem('minsah_cart', JSON.stringify([]));
    }
  }, [user]);

  // Save guest cart to localStorage on change (only when not logged in)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('minsah_cart', JSON.stringify(items));
    }
  }, [items, user]);

  // ─── Promo code ────────────────────────────────────────────────

  const applyPromoCode = () => {
    const validCodes: Record<string, number> = {
      'SAVE10': subtotal * 0.1,
      'SAVE20': subtotal * 0.2,
      'FIRST50': 50
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setDiscount(validCodes[promoCode.toUpperCase()]);
    } else {
      alert('Invalid promo code');
    }
  };

  // ─── Address functions ─────────────────────────────────────────

  const addAddress = (address: Omit<Address, 'id'>) => {
    const newAddress: Address = { ...address, id: Date.now().toString() };
    setAddresses(prev => [...prev, newAddress]);
    if (address.isDefault) setSelectedAddress(newAddress);
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setAddresses(prev => prev.map(addr =>
      addr.id === id ? { ...addr, ...updates } : addr
    ));
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    if (selectedAddress?.id === id) {
      setSelectedAddress(addresses[0] || null);
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      shippingCost,
      tax,
      total,
      promoCode,
      setPromoCode,
      applyPromoCode,
      discount,
      addresses,
      selectedAddress,
      setSelectedAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      paymentMethods,
      selectedPaymentMethod,
      setSelectedPaymentMethod,
      cartLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
