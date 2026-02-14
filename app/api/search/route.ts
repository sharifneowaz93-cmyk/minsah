import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/elasticsearch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, page, limit } = body;

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        success: false,
        products: [],
        total: 0,
        message: 'Search query is required' 
      });
    }

    // Search in Elasticsearch
    const result = await searchProducts(query, filters, page, limit);

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      page: page || 1,
      limit: limit || 20,
      hasMore: result.total > (page || 1) * (limit || 20)
    });

  } catch (error: any) {
    console.error('Search API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// GET method for simple queries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filters: any = {};
    
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category');
    }
    
    if (searchParams.get('inStock')) {
      filters.inStock = searchParams.get('inStock') === 'true';
    }

    if (searchParams.get('minPrice')) {
      filters.priceMin = parseFloat(searchParams.get('minPrice')!);
    }

    if (searchParams.get('maxPrice')) {
      filters.priceMax = parseFloat(searchParams.get('maxPrice')!);
    }

    const result = await searchProducts(query, filters, page, limit);

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      page,
      limit,
      hasMore: result.total > page * limit
    });

  } catch (error: any) {
    console.error('Search API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed' 
      },
      { status: 500 }
    );
  }
}
