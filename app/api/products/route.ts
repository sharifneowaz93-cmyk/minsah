import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock product data - replace with database calls
const mockProducts = [
  {
    id: '1',
    name: 'Premium Foundation',
    slug: 'premium-foundation',
    description: 'Long-lasting foundation with SPF 30 protection',
    price: 2500,
    originalPrice: 3000,
    images: ['/images/products/foundation-1.jpg'],
    category: 'makeup',
    subcategory: 'face',
    brand: 'Minsah Beauty',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    tags: ['foundation', 'spf', 'long-lasting'],
    sku: 'MS-FDN-001',
    weight: 30,
    dimensions: { length: 5, width: 5, height: 3 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Hydrating Face Serum',
    slug: 'hydrating-face-serum',
    description: '24-hour hydration with vitamin C and hyaluronic acid',
    price: 1800,
    originalPrice: null,
    images: ['/images/products/serum-1.jpg'],
    category: 'skincare',
    subcategory: 'serums',
    brand: 'Minsah Beauty',
    rating: 4.8,
    reviews: 256,
    inStock: true,
    tags: ['serum', 'hydration', 'vitamin-c'],
    sku: 'MS-SRM-002',
    weight: 30,
    dimensions: { length: 4, width: 4, height: 8 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let filteredProducts = [...mockProducts];

    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (subcategory) {
      filteredProducts = filteredProducts.filter(p => p.subcategory === subcategory);
    }

    if (brand) {
      filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
    }

    if (inStock === 'true') {
      filteredProducts = filteredProducts.filter(p => p.inStock);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'reviews':
          comparison = a.reviews - b.reviews;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return order === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const products = filteredProducts.slice(startIndex, endIndex);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        categories: Array.from(new Set(mockProducts.map(p => p.category))),
        brands: Array.from(new Set(mockProducts.map(p => p.brand))),
        priceRange: {
          min: Math.min(...mockProducts.map(p => p.price)),
          max: Math.max(...mockProducts.map(p => p.price))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'price', 'category', 'brand'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new product (in production, this would save to database)
    const newProduct = {
      id: Date.now().toString(),
      ...body,
      slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: 0,
      reviews: 0,
      inStock: body.inStock ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
