import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/elasticsearch';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const products = await searchProducts(query);

    return NextResponse.json({ 
      success: true,
      products 
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
