'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { filterProducts, sortProducts, parseSearchParams } from '@/lib/shopUtils';
import ProductCard from './ProductCard';
import ActiveFilters from './ActiveFilters';
import SortDropdown from './SortDropdown';
import type { Product as ShopProduct, SortOption } from '@/types/product';

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  sku: string;
  stock: number;
  category: string;
  categorySlug: string;
  rating: number;
  reviews: number;
  description: string;
  shortDescription: string;
  featured: boolean;
  isNew: boolean;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

function apiProductToShopProduct(p: ApiProduct): ShopProduct {
  const createdAt = new Date(p.createdAt);
  const discount =
    p.originalPrice != null && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : undefined;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug || toSlug(p.name),
    brand: p.brand,
    brandSlug: p.brandSlug || toSlug(p.brand),
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    discount,
    image: p.image,
    images: p.images?.length ? p.images : [p.image],
    sku: p.sku,
    stock: p.stock,
    category: p.category,
    categorySlug: p.categorySlug || toSlug(p.category),
    rating: p.rating,
    reviewCount: p.reviews,
    description: p.description || '',
    shortDescription: p.shortDescription || p.description?.substring(0, 100) || p.name,
    isNew: p.isNew,
    isBestSeller: false,
    isExclusive: false,
    isTrending: p.featured,
    skinType: undefined,
    skinConcerns: [],
    tags: p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    isVegan: false,
    isCrueltyFree: false,
    isOrganic: false,
    isHalalCertified: false,
    isBSTIApproved: false,
    isImported: false,
    hasVariants: false,
    isCODAvailable: true,
    isSameDayDelivery: false,
    freeShippingEligible: false,
    deliveryDays: 3,
    isEMIAvailable: false,
    views: 0,
    salesCount: 0,
    createdAt,
    updatedAt: new Date(p.updatedAt),
  };
}

export default function ShopGrid() {
  const searchParams = useSearchParams();
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '100', activeOnly: 'true' });

        const category = searchParams.get('category');
        const brand = searchParams.get('brand');
        const search = searchParams.get('search');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        if (category) params.set('category', category);
        if (brand) params.set('brand', brand);
        if (search) params.set('search', search);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setApiProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const allProducts = useMemo(
    () => apiProducts.map(apiProductToShopProduct),
    [apiProducts]
  );

  const filters = parseSearchParams(searchParams as unknown as URLSearchParams);
  const filtered = filterProducts(allProducts, filters);
  const sorted = sortProducts(filtered, (filters.sort || 'featured') as SortOption);

  const pageSize = 20;
  const page = filters.page || 1;
  const start = (page - 1) * pageSize;
  const paginatedProducts = sorted.slice(start, start + pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const hasMore = page < totalPages;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="w-full aspect-square bg-minsah-accent/30 rounded-lg mb-3" />
            <div className="h-4 bg-minsah-accent/30 rounded w-3/4 mb-2" />
            <div className="h-4 bg-minsah-accent/30 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <ActiveFilters totalProducts={sorted.length} />
        </div>
        <div className="flex-shrink-0">
          <SortDropdown />
        </div>
      </div>

      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/shop?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(page + 1),
                }).toString()}`}
                className="px-6 py-3 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition-colors font-semibold flex items-center gap-2"
              >
                Load More Products
                <ChevronRight size={20} />
              </Link>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-minsah-secondary">
            Showing {start + 1}&ndash;{Math.min(start + pageSize, sorted.length)} of {sorted.length}{' '}
            products
            {totalPages > 1 && ` \u2022 Page ${page} of ${totalPages}`}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 text-minsah-secondary">&#128269;</div>
          <h3 className="text-2xl font-bold text-minsah-dark mb-2">No products found</h3>
          <p className="text-minsah-secondary mb-6">
            Try adjusting your filters or search for something else
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition-colors font-semibold"
          >
            Clear All Filters
          </Link>
        </div>
      )}
    </>
  );
}
