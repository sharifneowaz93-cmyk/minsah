import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { mockProducts, filterOptions } from '@/lib/productData';
import { filterProducts, sortProducts, parseSearchParams, generatePageTitle, generateMetaDescription } from '@/lib/shopUtils';
import ProductCard from '@/app/components/shop/ProductCard';
import ActiveFilters from '@/app/components/shop/ActiveFilters';
import SortDropdown from '@/app/components/shop/SortDropdown';

// Generate dynamic metadata
export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value.join(',') : value);
  });

  const filters = parseSearchParams(params);
  const title = generatePageTitle(filters);
  const description = generateMetaDescription(filters, mockProducts.length);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

// Loading skeleton component
function ProductGridSkeleton() {
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

// Main Shop Page Content (Server Component)
async function ShopContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // Parse search params
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value.join(',') : value);
  });

  const filters = parseSearchParams(params);

  // Filter and sort products
  const filtered = filterProducts(mockProducts, filters);
  const sorted = sortProducts(filtered, filters.sort || 'featured');

  // Pagination
  const pageSize = 20;
  const page = filters.page || 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedProducts = sorted.slice(start, end);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const hasMore = page < totalPages;

  return (
    <>
      {/* Active Filters & Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <ActiveFilters totalProducts={sorted.length} />
        </div>
        <div className="flex-shrink-0">
          <SortDropdown />
        </div>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More / Pagination */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/shop?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(page + 1) }).toString()}`}
                className="px-6 py-3 bg-minsah-primary text-white rounded-lg hover:bg-minsah-dark transition-colors font-semibold flex items-center gap-2"
              >
                Load More Products
                <ChevronRight size={20} />
              </Link>
            </div>
          )}

          {/* Page Info */}
          <div className="mt-6 text-center text-sm text-minsah-secondary">
            Showing {start + 1}-{Math.min(end, sorted.length)} of {sorted.length} products
            {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
          </div>
        </>
      ) : (
        /* Empty State */
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

// Main Shop Page Component
export default function ShopPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="min-h-screen bg-minsah-light pb-20">
      {/* Header */}
      <div className="bg-white border-b border-minsah-accent sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-minsah-secondary mb-3">
            <Link href="/" className="hover:text-minsah-primary transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-minsah-dark font-medium">Shop</span>
          </div>

          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-minsah-dark">
                Shop Beauty Products
              </h1>
              <p className="text-sm text-minsah-secondary mt-1">
                Discover premium beauty products from top brands
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={48} className="text-minsah-primary animate-spin mb-4" />
              <p className="text-minsah-secondary">Loading products...</p>
            </div>
          }
        >
          <ShopContent searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Free Shipping Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 text-center text-sm font-medium shadow-lg md:hidden z-30">
        &#128666; Free Shipping on orders above ৳1,000
      </div>
    </div>
  );
}
