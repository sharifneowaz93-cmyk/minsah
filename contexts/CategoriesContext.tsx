'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Subcategory {
  name: string;
  items: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  href: string;
  icon?: string;
  subcategories: Subcategory[];
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CategoriesContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  saveCategories: (newCategories: Category[]) => void;
  getActiveCategories: () => Category[];
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const STORAGE_KEY = 'minsah_categories';

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Make Up',
    slug: 'make-up',
    href: '/shop?category=Make Up',
    productCount: 156,
    status: 'active',
    createdAt: '2024-01-01',
    subcategories: [
      { name: 'Face', items: ['Foundation', 'Concealer', 'Blush', 'Primer', 'Powder', 'Contour'] },
      { name: 'Eyes', items: ['Eyeshadow', 'Eyeliner', 'Mascara', 'Kajal', 'Eyebrow', 'Eye Primer'] },
      { name: 'Lips', items: ['Lipstick', 'Lip Gloss', 'Lip Balm', 'Lip Liner', 'Lip Stain'] },
      { name: 'Nails', items: ['Nail Polish', 'Nail Art', 'Nail Care', 'Manicure'] }
    ],
  },
  {
    id: '2',
    name: 'Skin care',
    slug: 'skin-care',
    href: '/shop?category=Skin care',
    productCount: 203,
    status: 'active',
    createdAt: '2024-01-01',
    subcategories: [
      { name: 'Cleansers', items: ['Face Wash', 'Micellar Water', 'Cleansing Oil', 'Wipes'] },
      { name: 'Moisturizers', items: ['Day Cream', 'Night Cream', 'Serum', 'Face Oil'] },
      { name: 'Sunscreen', items: ['SPF 30+', 'SPF 50+', 'Mineral', 'Tinted'] },
      { name: 'Treatment', items: ['Anti-Aging', 'Acne Care', 'Brightening', 'Hydration'] }
    ],
  },
  {
    id: '3',
    name: 'Hair care',
    slug: 'hair-care',
    href: '/shop?category=Hair care',
    productCount: 98,
    status: 'active',
    createdAt: '2024-01-01',
    subcategories: [
      { name: 'Shampoo', items: ['Anti-Dandruff', 'Hair Fall', 'Color Protection', 'Volume'] },
      { name: 'Conditioner', items: ['Daily Use', 'Deep Conditioner', 'Leave-In', 'Color Safe'] },
      { name: 'Hair Treatments', items: ['Hair Oil', 'Hair Mask', 'Serum', 'Heat Protectant'] },
      { name: 'Styling', items: ['Gel', 'Mousse', 'Hair Spray', 'Cream', 'Wax'] }
    ],
  },
  {
    id: '4',
    name: 'Perfume',
    slug: 'perfume',
    href: '/shop?category=Perfume',
    productCount: 134,
    status: 'active',
    createdAt: '2024-01-01',
    subcategories: [
      { name: 'Women', items: ['Floral', 'Fresh', 'Oriental', 'Woody'] },
      { name: 'Men', items: ['Citrus', 'Woody', 'Spicy', 'Aquatic'] },
      { name: 'Unisex', items: ['Fresh', 'Woody', 'Citrus', 'Musk'] },
      { name: 'Attar', items: ['Traditional', 'Arabian', 'Luxury', 'Premium'] }
    ],
  },
  {
    id: '5',
    name: 'SPA',
    slug: 'spa',
    href: '/shop?category=SPA',
    productCount: 67,
    status: 'active',
    createdAt: '2024-01-01',
    subcategories: [
      { name: 'Body Treatments', items: ['Body Scrub', 'Body Butter', 'Massage Oil', 'Body Wrap'] },
      { name: 'Facial Kits', items: ['Facial Masks', 'Peel Off Masks', 'Sheet Masks', 'Cream Masks'] },
      { name: 'Aromatherapy', items: ['Essential Oils', 'Diffusers', 'Candles', 'Bath Salts'] },
      { name: 'Relaxation', items: ['Bath Bombs', 'Shower Gels', 'Pampering Kits'] }
    ],
  },
  {
    id: '6',
    name: 'Nails',
    slug: 'nails',
    href: '/shop?category=Nails',
    productCount: 45,
    status: 'active',
    createdAt: '2024-01-01',
    subcategories: [
      { name: 'Nail Polish', items: ['Regular', 'Gel', 'Matte', 'Glossy'] },
      { name: 'Nail Care', items: ['Cuticle Oil', 'Nail Strengtheners', 'Nail Growth'] },
      { name: 'Nail Art', items: ['Stickers', 'Gems', 'Tools', 'Decorations'] },
      { name: 'Manicure', items: ['Kits', 'Tools', 'Buffers', 'Files'] }
    ],
  },
  {
    id: '7',
    name: 'Combo',
    slug: 'combo',
    href: '/shop?category=Combo',
    productCount: 89,
    status: 'active',
    createdAt: '2024-01-01',
    subcategories: [
      { name: '1001-1500 Taka Combo', items: ['Makeup Combo', 'Skincare Combo', 'Haircare Combo', 'Body Care Combo'] },
      { name: '1501-2000 Taka Combo', items: ['Premium Makeup Set', 'Facial Kit Combo', 'Hair Treatment Set', 'Spa Collection'] },
      { name: '2001-2500 Taka Combo', items: ['Luxury Beauty Box', 'Complete Skincare Set', 'Professional Makeup Kit', 'Pamper Package'] },
      { name: '2501-3000 Taka Combo', items: ['Deluxe Beauty Set', 'Ultimate Skincare', 'Pro Makeup Collection', 'Total Body Care'] }
    ],
  },
];

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCategories(parsed);
        } catch (error) {
          console.error('Error parsing stored categories:', error);
          setCategories(defaultCategories);
        }
      } else {
        setCategories(defaultCategories);
      }
    }
  }, []);

  // Save categories to localStorage whenever they change
  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
    }
  };

  // Get only active categories
  const getActiveCategories = () => {
    return categories.filter(cat => cat.status === 'active');
  };

  return (
    <CategoriesContext.Provider value={{ categories, setCategories, saveCategories, getActiveCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}

export type { Category, Subcategory };
