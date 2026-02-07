'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface CartItem {
  id: string;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Cart state
  const [items, setItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Mac Studio Foundation',
      price: 47.00,
      quantity: 1,
      image: '/images/products/foundation.jpg',
      sku: '#421C00'
    },
    {
      id: '2',
      name: 'Blush Stick - Makeup by mario',
      price: 32.00,
      quantity: 1,
      image: '/images/products/blush.jpg',
      sku: '#421C00'
    },
    {
      id: '3',
      name: 'Eyeshadow Palette by Anastasia',
      price: 33.00,
      quantity: 1,
      image: '/images/products/eyeshadow.jpg',
      sku: '#421C00'
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      fullName: 'John Doe',
      phoneNumber: '+880 1234 567890',
      landmark: 'Near City Center',
      provinceRegion: 'Dhaka',
      city: 'Dhaka',
      zone: 'Gulshan',
      address: 'House#123, street abc, NYC',
      type: 'home',
      isDefault: true,
      coordinates: { lat: 23.7937, lng: 90.4066 }
    }
  ]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(addresses[0] || null);

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
  const shippingCost = subtotal > 0 ? 0 : 0; // Free shipping for now
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shippingCost + tax - discount;

  // Cart functions
  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
    setDiscount(0);
  };

  // Promo code function
  const applyPromoCode = () => {
    // Simple promo code logic - replace with real API call
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

  // Address functions
  const addAddress = (address: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString()
    };
    setAddresses(prev => [...prev, newAddress]);
    if (address.isDefault) {
      setSelectedAddress(newAddress);
    }
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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('minsah_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('minsah_cart', JSON.stringify(items));
  }, [items]);

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
      setSelectedPaymentMethod
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
