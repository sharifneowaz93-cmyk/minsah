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

// Products loaded from database
const defaultProducts: Product[] = [];

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
