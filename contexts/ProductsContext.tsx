'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  item?: string;
  brand: string;
  originCountry: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  createdAt: string;
  featured: boolean;
  description?: string;

  // Specifications
  weight?: string;
  ingredients?: string;
  skinType?: string[];
  expiryDate?: string;
  shelfLife?: string;

  // Variants
  variants?: Array<{
    id: string;
    size?: string;
    color?: string;
    price: string;
    stock: string;
    sku: string;
  }>;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  urlSlug?: string;
  tags?: string;

  // Shipping
  shippingWeight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  isFragile?: boolean;
  freeShippingEligible?: boolean;

  // Discount
  discountPercentage?: string;
  salePrice?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  flashSaleEligible?: boolean;

  // Stock Management
  lowStockThreshold?: string;
  barcode?: string;

  // Additional Options
  returnEligible?: boolean;
  codAvailable?: boolean;
  preOrderOption?: boolean;
  relatedProducts?: string;
}

interface ProductsContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  saveProducts: (newProducts: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = 'minsah_products';

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Luxury Foundation Pro',
    category: 'Make Up',
    subcategory: 'Face',
    item: 'Foundation',
    brand: 'MAC',
    originCountry: 'USA',
    price: 45.99,
    originalPrice: 65.99,
    stock: 125,
    status: 'active',
    image: '/products/foundation.jpg',
    images: ['/products/foundation.jpg'],
    rating: 4.5,
    reviews: 234,
    createdAt: '2024-01-10',
    featured: true,
    description: 'Professional foundation with long-lasting coverage',
  },
  {
    id: '2',
    name: 'Organic Face Serum',
    category: 'Skin care',
    subcategory: 'Treatment',
    item: 'Serum',
    brand: 'The Ordinary',
    originCountry: 'UK',
    price: 89.99,
    originalPrice: 120.00,
    stock: 0,
    status: 'out_of_stock',
    image: '/products/serum.jpg',
    images: ['/products/serum.jpg'],
    rating: 4.8,
    reviews: 156,
    createdAt: '2024-01-08',
    featured: false,
    description: 'Hydrating serum with natural ingredients',
  },
  {
    id: '3',
    name: 'Professional Nail Kit',
    category: 'Nails',
    subcategory: 'Manicure',
    item: 'Kits',
    brand: 'Other',
    originCountry: 'China',
    price: 34.99,
    originalPrice: 45.00,
    stock: 89,
    status: 'active',
    image: '/products/nail-kit.jpg',
    images: ['/products/nail-kit.jpg'],
    rating: 4.2,
    reviews: 89,
    createdAt: '2024-01-05',
    featured: false,
    description: 'Complete nail care kit with all essential tools',
  },
  {
    id: '4',
    name: 'Premium Perfume Set',
    category: 'Perfume',
    subcategory: 'Women',
    item: 'Floral',
    brand: 'Chanel',
    originCountry: 'France',
    price: 156.99,
    originalPrice: 200.00,
    stock: 45,
    status: 'active',
    image: '/products/perfume.jpg',
    images: ['/products/perfume.jpg'],
    rating: 4.9,
    reviews: 412,
    createdAt: '2024-01-03',
    featured: true,
    description: 'Elegant floral fragrance collection',
  },
  {
    id: '5',
    name: 'Hair Care Bundle',
    category: 'Hair care',
    subcategory: 'Shampoo',
    item: 'Anti-Dandruff',
    brand: 'L\'Oréal Paris',
    originCountry: 'France',
    price: 67.99,
    originalPrice: 85.00,
    stock: 12,
    status: 'active',
    image: '/products/hair-care.jpg',
    images: ['/products/hair-care.jpg'],
    rating: 4.6,
    reviews: 178,
    createdAt: '2024-01-01',
    featured: false,
    description: 'Complete hair care solution bundle',
  },
];

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProducts(parsed);
        } catch (error) {
          console.error('Error parsing stored products:', error);
          setProducts(defaultProducts);
        }
      } else {
        setProducts(defaultProducts);
      }
    }
  }, []);

  // Save products to localStorage whenever they change
  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    }
  };

  // Add a new product
  const addProduct = (product: Product) => {
    const newProducts = [...products, product];
    saveProducts(newProducts);
  };

  // Update an existing product
  const updateProduct = (id: string, updatedProduct: Product) => {
    const newProducts = products.map(p => p.id === id ? updatedProduct : p);
    saveProducts(newProducts);
  };

  // Delete a product
  const deleteProduct = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    saveProducts(newProducts);
  };

  // Get product by ID
  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        setProducts,
        saveProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
