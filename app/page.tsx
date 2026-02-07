'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingCart, Home as HomeIcon, User, ChevronRight, Flame } from 'lucide-react';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

// Sample products data
const newArrivals = [
  { id: '1', name: 'Blush Stick Makeup by Mario', price: 32, image: '💄', sku: '#421C00' },
  { id: '2', name: 'Eye Liner Saga', price: 15, image: '✏️', sku: '#421C00' },
  { id: '3', name: 'Highlighter Shimla Beauty', price: 23, image: '✨', sku: '#421C00' },
  { id: '4', name: 'Lipstick Rose Pink', price: 28, image: '💋', sku: '#421C00' },
  { id: '5', name: 'Concealer Oil coconuts', price: 40, image: '🧴', sku: '#421C00' },
  { id: '6', name: 'Eye Liner Kiss Nomzy', price: 40, image: '👁️', sku: '#421C00' },
  { id: '7', name: 'Eye Liner Nagid', price: 15, image: '✏️', sku: '#421C00' },
  { id: '8', name: 'Highlighter Evan Binary', price: 38, image: '✨', sku: '#421C00' },
];

const forYouProducts = [
  { id: '9', name: 'Blush Stick Makeup by Mario', price: 32, image: '💄' },
  { id: '10', name: 'Eye Liner Nagid', price: 15, image: '✏️' },
  { id: '11', name: 'Highlighter Shimla Benny Beauty', price: 53, image: '✨' },
];

const recommendations = [
  { id: '12', name: 'Blush Mlick Makeup by Mario', price: 32, rating: 5, reviews: 6, image: '💄' },
  { id: '13', name: 'Eye Liner Nagid', price: 15, rating: 5, reviews: 6, image: '✏️' },
  { id: '14', name: 'Color Corrector Helez Beauty', price: 28, rating: 5, reviews: 6, image: '🎨' },
  { id: '15', name: 'Brontzo Dohd browon', price: 10, rating: 4, reviews: 6, image: '🖌️' },
  { id: '16', name: 'Eye Palette Revenda', price: 10, rating: 4, reviews: 0, image: '🎨' },
];

const favourites = [
  { id: '17', name: 'Lip Gloss Xellion', price: 25, rating: 5, reviews: 6, image: '💋' },
  { id: '18', name: 'Fragrance E-Him', price: 200, rating: 1, reviews: 6, image: '🌸' },
  { id: '19', name: 'Foschresh Skingle', price: 8, rating: 3, reviews: 0, image: '🧴' },
  { id: '20', name: 'Fragrance Oman', price: 20, rating: 0, reviews: 0, image: '🌺' },
  { id: '21', name: 'Fragrance Quent', price: 10, rating: 0, reviews: 0, image: '🌹' },
  { id: '22', name: 'Wrinkle Cream Uteopia', price: 35, rating: 3, reviews: 0, image: '🧴' },
];

const brands = [
  { name: 'MAC', logo: 'MAC' },
  { name: 'Dior', logo: 'Dior' },
  { name: 'Fenty Beauty', logo: 'FENTY\nBEAUTY' },
  { name: 'Chanel', logo: 'CHANEL' },
];

const categories = [
  { name: 'Makeup', icon: '💄', color: 'bg-pink-100' },
  { name: 'Skincare', icon: '🧴', color: 'bg-blue-100' },
  { name: 'Hair Care', icon: '💆‍♀️', color: 'bg-purple-100' },
  { name: 'Fragrance', icon: '🌸', color: 'bg-yellow-100' },
  { name: 'Tools', icon: '🖌️', color: 'bg-green-100' },
];

const flashSaleProducts = [
  { id: 'f1', name: 'Mush Stick Makeup by Mario', price: 32, originalPrice: 50, discount: 36, image: '💄' },
  { id: 'f2', name: 'Foundation Charlotta Tilbury', price: 30, originalPrice: 50, discount: 40, image: '🧴' },
  { id: 'f3', name: 'Eye Liner Sega', price: 13, originalPrice: 25, discount: 48, image: '✏️' },
  { id: 'f4', name: 'Co', price: 14, originalPrice: 30, discount: 53, image: '🖌️' },
];

const comboSlides = [
  {
    title: 'Best Value Combos',
    description: 'Save More with Our Curated Sets',
    gradient: 'from-minsah-primary via-minsah-secondary to-minsah-dark',
    image: '🎁'
  },
  {
    title: 'Premium Combo Deals',
    description: 'Luxury Beauty at Great Prices',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    image: '💎'
  },
  {
    title: 'Complete Care Sets',
    description: 'Everything You Need in One Box',
    gradient: 'from-blue-500 via-teal-400 to-green-400',
    image: '✨'
  },
];

export default function HomePage() {
  const { items } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentComboSlide, setCurrentComboSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 7, minutes: 33, seconds: 28 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-slide promotion
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 2);
    }, 5000);

    return () => clearInterval(slideTimer);
  }, []);

  // Auto-slide combos
  useEffect(() => {
    const comboSlideTimer = setInterval(() => {
      setCurrentComboSlide(prev => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(comboSlideTimer);
  }, []);

  return (
    <div className="min-h-screen bg-minsah-light pb-20">
      {/* Header */}
      <header className="bg-minsah-dark text-minsah-light sticky top-0 z-50 shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs">9:41</span>
            </div>
            <h1 className="text-xl font-bold font-[\'Tenor_Sans\']">Home</h1>
            <div className="w-12"></div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-minsah-secondary" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here"
              className="w-full pl-10 pr-4 py-2.5 bg-minsah-accent text-minsah-dark placeholder:text-minsah-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-minsah-primary"
            />
          </div>
        </div>
      </header>

      {/* Browse by Categories */}
      <section className="px-4 py-6 bg-white">
        <h2 className="text-lg font-bold text-minsah-dark mb-4">Browse by Categories</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${category.name.toLowerCase().replace(' ', '-')}`}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-3xl`}>
                {category.icon}
              </div>
              <span className="text-xs text-minsah-dark font-medium text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotion Section */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-bold text-minsah-dark mb-4">Promotion Section</h2>
        <div className="relative">
          {/* Carousel */}
          <div className="bg-gradient-to-br from-pink-500 via-pink-400 to-orange-400 rounded-3xl p-6 min-h-[200px] flex items-center justify-between overflow-hidden">
            <div className="text-white z-10">
              <h3 className="text-2xl font-bold mb-2">Exclusive<br/>Winter<br/>2022-23</h3>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-16 h-16 bg-white/30 rounded-full"></div>
              <div className="w-20 h-20 bg-white/40 rounded-full"></div>
              <div className="w-16 h-16 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            <div className={`h-1.5 rounded-full transition-all ${currentSlide === 0 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
            <div className={`h-1.5 rounded-full transition-all ${currentSlide === 1 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
          </div>
        </div>
      </section>

      {/* Browse by Combos */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">Browse by Combos</h2>
          <Link href="/combos" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="relative">
          {/* Combo Carousel */}
          <Link href="/combos" className="block">
            <div className={`bg-gradient-to-br ${comboSlides[currentComboSlide].gradient} rounded-3xl p-6 min-h-[200px] flex items-center justify-between overflow-hidden transition-all duration-500`}>
              <div className="text-white z-10 flex-1">
                <h3 className="text-2xl font-bold mb-2">{comboSlides[currentComboSlide].title}</h3>
                <p className="text-sm opacity-90">{comboSlides[currentComboSlide].description}</p>
              </div>
              <div className="text-7xl opacity-20">
                {comboSlides[currentComboSlide].image}
              </div>
            </div>
          </Link>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            <div className={`h-1.5 rounded-full transition-all ${currentComboSlide === 0 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
            <div className={`h-1.5 rounded-full transition-all ${currentComboSlide === 1 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
            <div className={`h-1.5 rounded-full transition-all ${currentComboSlide === 2 ? 'w-6 bg-minsah-primary' : 'w-1.5 bg-minsah-secondary'}`}></div>
          </div>
        </div>

        {/* Combo Categories Preview */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/combos" className="bg-minsah-accent rounded-xl p-4 flex items-center gap-3">
            <div className="text-3xl">💄</div>
            <div>
              <h4 className="font-semibold text-sm text-minsah-dark">Makeup Combos</h4>
              <p className="text-xs text-minsah-secondary">From Tk 1001</p>
            </div>
          </Link>
          <Link href="/combos" className="bg-minsah-accent rounded-xl p-4 flex items-center gap-3">
            <div className="text-3xl">✨</div>
            <div>
              <h4 className="font-semibold text-sm text-minsah-dark">Skincare Sets</h4>
              <p className="text-xs text-minsah-secondary">From Tk 1001</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="px-4 py-6 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={24} />
            <h2 className="text-lg font-bold text-minsah-dark">Flash Sale</h2>
          </div>
          <Link href="/flash-sale" className="text-sm text-minsah-primary font-semibold">
            Shop Now
          </Link>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-minsah-secondary">Ends in:</span>
          <div className="flex gap-1">
            <div className="bg-minsah-primary text-white px-2 py-1 rounded text-xs font-bold min-w-[24px] text-center">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <span className="text-minsah-dark">:</span>
            <div className="bg-minsah-primary text-white px-2 py-1 rounded text-xs font-bold min-w-[24px] text-center">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="text-minsah-dark">:</span>
            <div className="bg-minsah-primary text-white px-2 py-1 rounded text-xs font-bold min-w-[24px] text-center">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="text-minsah-dark">:</span>
            <div className="bg-minsah-primary text-white px-2 py-1 rounded text-xs font-bold min-w-[24px] text-center">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Flash Sale Products */}
        <div className="grid grid-cols-2 gap-3">
          {flashSaleProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-xl p-3 shadow-sm"
            >
              <div className="relative mb-2">
                <div className="w-full aspect-square bg-minsah-accent rounded-lg flex items-center justify-center text-4xl mb-2">
                  {product.image}
                </div>
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {product.discount}%
                </div>
              </div>
              <h3 className="text-xs font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-minsah-primary">
                  {formatPrice(convertUSDtoBDT(product.price))}
                </span>
                <span className="text-xs text-minsah-secondary line-through">
                  {formatPrice(convertUSDtoBDT(product.originalPrice))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrival */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">New Arrival</h2>
          <Link href="/new-arrivals" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {newArrivals.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-minsah-accent rounded-2xl p-3"
            >
              <div className="relative mb-2">
                <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center text-4xl mb-2">
                  {product.image}
                </div>
                <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart size={16} className="text-minsah-secondary" />
                </button>
              </div>
              <h3 className="text-xs font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-xs text-minsah-secondary mb-1">{product.sku}</p>
              <span className="text-sm font-bold text-minsah-primary">
                {formatPrice(convertUSDtoBDT(product.price))}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* For You */}
      <section className="px-4 py-6 bg-minsah-light">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">For You</h2>
          <Link href="/for-you" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {forYouProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-2xl p-3 flex-shrink-0 w-32"
            >
              <div className="relative mb-2">
                <div className="w-full aspect-square bg-minsah-accent rounded-xl flex items-center justify-center text-4xl mb-2">
                  {product.image}
                </div>
                <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart size={14} className="text-minsah-secondary fill-red-500" />
                </button>
              </div>
              <h3 className="text-xs font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
              <span className="text-sm font-bold text-minsah-primary">
                {formatPrice(convertUSDtoBDT(product.price))}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommendation */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">Recommendation</h2>
          <Link href="/recommendations" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {recommendations.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-minsah-accent rounded-xl p-2"
            >
              <div className="relative mb-2">
                <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center text-2xl mb-1">
                  {product.image}
                </div>
                <button className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart size={12} className="text-minsah-secondary" />
                </button>
              </div>
              <h3 className="text-[10px] font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-bold text-minsah-primary">
                  {formatPrice(convertUSDtoBDT(product.price))}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400 text-[10px]">
                  {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
                </div>
                <span className="text-[8px] text-minsah-secondary">({product.reviews})</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Favourite */}
      <section className="px-4 py-6 bg-minsah-light">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">Favourite</h2>
          <Link href="/favourites" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {favourites.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-xl p-2"
            >
              <div className="relative mb-2">
                <div className="w-full aspect-square bg-minsah-accent rounded-lg flex items-center justify-center text-2xl mb-1">
                  {product.image}
                </div>
                <button className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart size={12} className="text-red-500 fill-red-500" />
                </button>
              </div>
              <h3 className="text-[10px] font-semibold text-minsah-dark mb-1 line-clamp-2">{product.name}</h3>
              <span className="text-xs font-bold text-minsah-primary">
                {formatPrice(convertUSDtoBDT(product.price))}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse Popular Brand */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-minsah-dark">Browse Popular Brand</h2>
          <Link href="/brands" className="text-sm text-minsah-primary font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={`/brands/${brand.name.toLowerCase().replace(' ', '-')}`}
              className="bg-white border-2 border-minsah-accent rounded-full aspect-square flex items-center justify-center p-2 hover:border-minsah-primary transition"
            >
              <span className="text-xs font-bold text-minsah-dark text-center whitespace-pre-line">
                {brand.logo}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-minsah-accent shadow-lg z-50">
        <div className="flex items-center justify-around py-3">
          <Link href="/" className="flex flex-col items-center gap-1 text-minsah-primary">
            <HomeIcon size={24} />
            <span className="text-xs font-semibold">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <Search size={24} />
            <span className="text-xs">Search</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <Heart size={24} />
            <span className="text-xs">Wishlist</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition relative">
            <ShoppingCart size={24} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
            <span className="text-xs">Cart</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-1 text-minsah-secondary hover:text-minsah-primary transition">
            <User size={24} />
            <span className="text-xs">Account</span>
          </Link>
        </div>
      </nav>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
