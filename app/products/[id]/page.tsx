'use client';

import { useParams } from 'next/navigation';
import Navbar from '../../components/Header';
import TopBar from '../../components/TopBar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';
import { useProducts } from '@/contexts/ProductsContext';

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const isUrl = src.startsWith('/') || src.startsWith('http') || src.startsWith('data:');
  if (isUrl) {
    return <img src={src} alt={alt} className="w-full h-full object-contain" />;
  }
  return <span className="text-9xl">{src}</span>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) ?? '';
  const { getProductById } = useProducts();

  const stored = getProductById(id);

  const product = stored
    ? {
        id: stored.id,
        name: stored.name,
        price: stored.price,
        originalPrice: stored.originalPrice,
        description: stored.description || '',
        category: stored.category,
        inStock: stored.status === 'active' && stored.stock > 0,
        rating: stored.rating,
        reviews: stored.reviews,
        image: stored.image,
      }
    : {
        id,
        name: 'Premium Face Serum',
        price: 29.99,
        originalPrice: 49.99,
        description:
          'Nourish your skin with this toxin-free premium face serum. Formulated with natural ingredients to provide deep hydration and anti-aging benefits.',
        category: 'Skin care',
        inStock: true,
        rating: 4.5,
        reviews: 128,
        image: '💄',
      };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Link href="/shop" className="text-pink-600 hover:underline">← Back to Shop</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
              <ProductImage src={product.image} alt={product.name} />
            </div>

            {/* Product Info */}
            <div>
              <p className="text-pink-600 font-semibold mb-2">{product.category}</p>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.round(product.rating))}
                  {'☆'.repeat(5 - Math.round(product.rating))}
                </div>
                <span className="text-gray-600">({product.reviews} reviews)</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl font-bold text-pink-600">
                    {formatPrice(convertUSDtoBDT(product.price))}
                  </span>
                  {product.originalPrice != null && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(convertUSDtoBDT(product.originalPrice))}
                      </span>
                      <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded text-sm font-semibold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100">-</button>
                  <span className="text-lg font-semibold">1</span>
                  <button className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100">+</button>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <button className="flex-1 bg-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink-700 transition">
                  Add to Cart
                </button>
                <button className="px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                  ♡
                </button>
              </div>

              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Availability:</span>{' '}
                  {product.inStock ? (
                    <span className="text-green-600">In Stock</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">SKU:</span> {product.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
