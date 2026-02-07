import { Product, FilterOptions } from '@/types/product';

// Mock Product Data for Minsah Beauty
export const mockProducts: Product[] = [
  // Lipsticks
  {
    id: '1',
    name: 'Ruby Woo Matte Lipstick',
    slug: 'ruby-woo-matte-lipstick',
    brand: 'MAC',
    brandSlug: 'mac',
    price: 2500,
    originalPrice: 3000,
    discount: 17,
    image: 'LIPSTICK',
    images: ['LIPSTICK', 'LIPSTICK-2'],
    sku: 'MAC-RW-001',
    stock: 15,
    category: 'Makeup',
    categorySlug: 'makeup',
    subcategory: 'Lipstick',
    subcategorySlug: 'lipstick',
    rating: 4.8,
    reviewCount: 234,
    description: 'Iconic blue-red matte lipstick with rich color payoff',
    shortDescription: 'Iconic blue-red matte finish',
    isNew: false,
    isBestSeller: true,
    isExclusive: false,
    isTrending: true,
    skinType: ['normal', 'oily', 'dry', 'combination', 'sensitive'],
    skinConcerns: [],
    tags: ['long-lasting', 'matte'],
    isVegan: false,
    isCrueltyFree: false,
    isOrganic: false,
    isHalalCertified: true,
    isBSTIApproved: true,
    isImported: true,
    hasVariants: false,
    isCODAvailable: true,
    isSameDayDelivery: true,
    freeShippingEligible: true,
    deliveryDays: 2,
    isEMIAvailable: false,
    views: 5234,
    salesCount: 487,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-05'),
  },
  {
    id: '2',
    name: 'Velvet Teddy Lipstick',
    slug: 'velvet-teddy-lipstick',
    brand: 'MAC',
    brandSlug: 'mac',
    price: 2500,
    image: 'LIPSTICK',
    images: ['LIPSTICK'],
    sku: 'MAC-VT-002',
    stock: 8,
    category: 'Makeup',
    categorySlug: 'makeup',
    subcategory: 'Lipstick',
    subcategorySlug: 'lipstick',
    rating: 4.7,
    reviewCount: 189,
    description: 'Neutral matte brown lipstick perfect for everyday wear',
    shortDescription: 'Neutral matte brown shade',
    isNew: false,
    isBestSeller: true,
    isExclusive: false,
    isTrending: false,
    skinType: ['normal', 'oily', 'dry', 'combination'],
    skinConcerns: [],
    tags: ['matte', 'nude'],
    isVegan: false,
    isCrueltyFree: false,
    isOrganic: false,
    isHalalCertified: true,
    isBSTIApproved: true,
    isImported: true,
    hasVariants: false,
    isCODAvailable: true,
    isSameDayDelivery: false,
    freeShippingEligible: true,
    deliveryDays: 3,
    isEMIAvailable: false,
    views: 3421,
    salesCount: 356,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2025-01-03'),
  },
  // Foundation
  {
    id: '3',
    name: 'Double Wear Stay-in-Place Foundation',
    slug: 'double-wear-foundation',
    brand: 'Estee Lauder',
    brandSlug: 'estee-lauder',
    price: 5200,
    originalPrice: 6500,
    discount: 20,
    image: 'FOUNDATION',
    images: ['FOUNDATION'],
    sku: 'EL-DW-003',
    stock: 12,
    category: 'Makeup',
    categorySlug: 'makeup',
    subcategory: 'Foundation',
    subcategorySlug: 'foundation',
    rating: 4.9,
    reviewCount: 456,
    description: '24-hour flawless matte coverage foundation',
    shortDescription: '24hr matte coverage',
    isNew: false,
    isBestSeller: true,
    isExclusive: true,
    isTrending: true,
    skinType: ['oily', 'combination'],
    skinConcerns: ['pores', 'acne'],
    tags: ['long-lasting', 'full-coverage'],
    isVegan: false,
    isCrueltyFree: false,
    isOrganic: false,
    isHalalCertified: false,
    isBSTIApproved: true,
    isImported: true,
    hasVariants: true,
    variants: [
      { id: 'v1', name: 'Shade', option: 'Shade', value: '1W1 Bone', price: 5200, stock: 4, sku: 'EL-DW-1W1' },
      { id: 'v2', name: 'Shade', option: 'Shade', value: '2W1 Dawn', price: 5200, stock: 5, sku: 'EL-DW-2W1' },
      { id: 'v3', name: 'Shade', option: 'Shade', value: '3W1 Tawny', price: 5200, stock: 3, sku: 'EL-DW-3W1' },
    ],
    isCODAvailable: true,
    isSameDayDelivery: true,
    freeShippingEligible: true,
    deliveryDays: 2,
    isEMIAvailable: true,
    emiMonths: [3, 6],
    views: 8932,
    salesCount: 623,
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2025-01-06'),
  },
  // Skincare
  {
    id: '4',
    name: 'Hyaluronic Acid 2% + B5 Serum',
    slug: 'hyaluronic-acid-serum',
    brand: 'The Ordinary',
    brandSlug: 'the-ordinary',
    price: 850,
    image: 'SERUM',
    images: ['SERUM'],
    sku: 'TO-HA-004',
    stock: 25,
    category: 'Skincare',
    categorySlug: 'skincare',
    subcategory: 'Serum',
    subcategorySlug: 'serum',
    rating: 4.6,
    reviewCount: 892,
    description: 'Hydrating serum with hyaluronic acid and vitamin B5',
    shortDescription: 'Deep hydration serum',
    isNew: false,
    isBestSeller: true,
    isExclusive: false,
    isTrending: true,
    skinType: ['dry', 'normal', 'combination', 'sensitive'],
    skinConcerns: ['dryness', 'aging'],
    tags: ['hydrating', 'anti-aging'],
    isVegan: true,
    isCrueltyFree: true,
    isOrganic: false,
    isHalalCertified: true,
    isBSTIApproved: true,
    isImported: true,
    hasVariants: false,
    isCODAvailable: true,
    isSameDayDelivery: false,
    freeShippingEligible: false,
    deliveryDays: 3,
    isEMIAvailable: false,
    views: 6745,
    salesCount: 734,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2025-01-04'),
  },
  {
    id: '5',
    name: 'Niacinamide 10% + Zinc 1% Serum',
    slug: 'niacinamide-serum',
    brand: 'The Ordinary',
    brandSlug: 'the-ordinary',
    price: 750,
    originalPrice: 900,
    discount: 17,
    image: 'SERUM',
    images: ['SERUM'],
    sku: 'TO-NZ-005',
    stock: 30,
    category: 'Skincare',
    categorySlug: 'skincare',
    subcategory: 'Serum',
    subcategorySlug: 'serum',
    rating: 4.5,
    reviewCount: 1123,
    description: 'Reduces appearance of pores and blemishes',
    shortDescription: 'Pore-refining serum',
    isNew: false,
    isBestSeller: true,
    isExclusive: false,
    isTrending: true,
    skinType: ['oily', 'combination', 'normal'],
    skinConcerns: ['pores', 'acne', 'dark-spots'],
    tags: ['brightening', 'oil-control'],
    isVegan: true,
    isCrueltyFree: true,
    isOrganic: false,
    isHalalCertified: true,
    isBSTIApproved: true,
    isImported: true,
    hasVariants: false,
    isCODAvailable: true,
    isSameDayDelivery: false,
    freeShippingEligible: false,
    deliveryDays: 3,
    isEMIAvailable: false,
    views: 9234,
    salesCount: 856,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2025-01-05'),
  },
  {
    id: '6',
    name: 'Advanced Night Repair Serum',
    slug: 'advanced-night-repair',
    brand: 'Estee Lauder',
    brandSlug: 'estee-lauder',
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    image: 'SERUM',
    images: ['SERUM'],
    sku: 'EL-ANR-006',
    stock: 7,
    category: 'Skincare',
    categorySlug: 'skincare',
    subcategory: 'Serum',
    subcategorySlug: 'serum',
    rating: 4.9,
    reviewCount: 678,
    description: 'Anti-aging night repair serum with ChronoluxCB technology',
    shortDescription: 'Anti-aging night serum',
    isNew: true,
    isBestSeller: false,
    isExclusive: true,
    isTrending: true,
    skinType: ['dry', 'normal', 'combination', 'sensitive'],
    skinConcerns: ['aging', 'dryness', 'dark-spots'],
    tags: ['anti-aging', 'luxury'],
    isVegan: false,
    isCrueltyFree: false,
    isOrganic: false,
    isHalalCertified: false,
    isBSTIApproved: true,
    isImported: true,
    hasVariants: false,
    isCODAvailable: true,
    isSameDayDelivery: true,
    freeShippingEligible: true,
    deliveryDays: 2,
    isEMIAvailable: true,
    emiMonths: [3, 6, 12],
    views: 4523,
    salesCount: 234,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-07'),
  },
];

// Generate filter options from products
export function getFilterOptions(products: Product[]): FilterOptions {
  const categories = new Map<string, { name: string; slug: string; count: number }>();
  const brands = new Map<string, { name: string; slug: string; count: number }>();
  const subcategories = new Map<string, Map<string, { name: string; slug: string; count: number }>>();

  let minPrice = Infinity;
  let maxPrice = 0;

  products.forEach(product => {
    // Categories
    if (!categories.has(product.categorySlug)) {
      categories.set(product.categorySlug, {
        name: product.category,
        slug: product.categorySlug,
        count: 0,
      });
    }
    categories.get(product.categorySlug)!.count++;

    // Subcategories
    if (product.subcategory && product.subcategorySlug) {
      if (!subcategories.has(product.categorySlug)) {
        subcategories.set(product.categorySlug, new Map());
      }
      const catSubcats = subcategories.get(product.categorySlug)!;
      if (!catSubcats.has(product.subcategorySlug)) {
        catSubcats.set(product.subcategorySlug, {
          name: product.subcategory,
          slug: product.subcategorySlug,
          count: 0,
        });
      }
      catSubcats.get(product.subcategorySlug)!.count++;
    }

    // Brands
    if (!brands.has(product.brandSlug)) {
      brands.set(product.brandSlug, {
        name: product.brand,
        slug: product.brandSlug,
        count: 0,
      });
    }
    brands.get(product.brandSlug)!.count++;

    // Price range
    minPrice = Math.min(minPrice, product.price);
    maxPrice = Math.max(maxPrice, product.price);
  });

  // Convert to arrays
  const categoryFilters = Array.from(categories.values()).map(cat => ({
    id: cat.slug,
    name: cat.name,
    slug: cat.slug,
    count: cat.count,
    subcategories: subcategories.has(cat.slug)
      ? Array.from(subcategories.get(cat.slug)!.values()).map(sub => ({
          id: sub.slug,
          name: sub.name,
          slug: sub.slug,
          count: sub.count,
        }))
      : [],
  }));

  const brandFilters = Array.from(brands.values()).map(brand => ({
    id: brand.slug,
    name: brand.name,
    slug: brand.slug,
    count: brand.count,
  }));

  return {
    categories: categoryFilters,
    brands: brandFilters,
    priceRange: {
      min: Math.floor(minPrice / 100) * 100,
      max: Math.ceil(maxPrice / 100) * 100,
    },
    skinTypes: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
    skinConcerns: ['acne', 'aging', 'dryness', 'sensitivity', 'dark-spots', 'pores'],
    ratings: [4, 3, 2, 1],
    tags: [
      { id: 'vegan', name: 'Vegan', slug: 'vegan' },
      { id: 'cruelty-free', name: 'Cruelty-Free', slug: 'cruelty-free' },
      { id: 'organic', name: 'Organic', slug: 'organic' },
      { id: 'halal', name: 'Halal Certified', slug: 'halal' },
    ],
  };
}

export const filterOptions = getFilterOptions(mockProducts);
