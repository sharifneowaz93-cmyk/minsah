'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { mockProducts } from '@/lib/productData';
import { adminProductToShopProduct } from '@/lib/productAdapter';
import { filterProducts, sortProducts, parseSearchParams } from '@/lib/shopUtils';
import ProductCard from './ProductCard';
import ActiveFilters from './ActiveFilters';
import SortDropdown from './SortDropdown';
import type { SortOption } from '@/types/product';

export default function ShopGrid() {
  const { products: adminProducts } = useProducts();
  const searchParams = useSearchParams();

  const allProducts = useMemo(() => {
    // Convert active admin products to shop format
    const converted = adminProducts
      .filter(p => p.status === 'active')
      .map(adminProductToShopProduct);

    // Merge: admin products first (newer), then mockProducts that don't share an id
    const adminIds = new Set(converted.map(p => p.id));
    const staticFallback = mockProducts.filter(p => !adminIds.has(p.id));
    return [...converted, ...staticFallback];
  }, [adminProducts]);

  const filters = parseSearchParams(searchParams as unknown as URLSearchParams);
  const filtered = filterProducts(allProducts, filters);
  const sorted = sortProducts(filtered, (filters.sort || 'featured') as SortOption);

  const pageSize = 20;
  const page = filters.page || 1;
  const start = (page - 1) * pageSize;
  const paginatedProducts = sorted.slice(start, start + pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const hasMore = page < totalPages;

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
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/shop?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page + 1) }).toString()}`}
                className="px-6 py-3 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition-colors font-semibold flex items-center gap-2"
              >
                Load More Products
                <ChevronRight size={20} />
              </Link>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-minsah-secondary">
            Showing {start + 1}–{Math.min(start + pageSize, sorted.length)} of {sorted.length} products
            {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
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
