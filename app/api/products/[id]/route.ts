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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = mockProducts.find(p => p.id === id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = mockProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    // Get product reviews (mock data for now)
    const reviews = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Khan',
        rating: 5,
        title: 'Amazing product!',
        content: 'I love this foundation. It gives great coverage and lasts all day.',
        verified: true,
        helpful: 12,
        createdAt: new Date('2024-01-15').toISOString()
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Fatima Ahmed',
        rating: 4,
        title: 'Good but expensive',
        content: 'Great quality but a bit pricey for the quantity.',
        verified: true,
        helpful: 8,
        createdAt: new Date('2024-01-10').toISOString()
      }
    ];

    return NextResponse.json({
      product,
      relatedProducts,
      reviews,
      rating: {
        average: product.rating,
        total: product.reviews,
        distribution: {
          5: 80,
          4: 30,
          3: 12,
          2: 4,
          1: 2
        }
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productIndex = mockProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Update product (in production, this would update in database)
    const updatedProduct = {
      ...mockProducts[productIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productIndex = mockProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product (in production, this would delete from database)
    // For now, just return success response
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}