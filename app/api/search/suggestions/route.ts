import { NextRequest, NextResponse } from 'next/server';
import { esClient, PRODUCT_INDEX } from '@/lib/elasticsearch';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q') || '';
    const category = request.nextUrl.searchParams.get('category');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '5');

    if (!query.trim()) {
      return NextResponse.json({ 
        success: true, 
        suggestions: [] 
      });
    }

    // Use Elasticsearch completion suggester
    const response = await esClient.search({
      index: PRODUCT_INDEX,
      body: {
        suggest: {
          product_suggest: {
            prefix: query,
            completion: {
              field: 'name.suggest',
              size: limit,
              skip_duplicates: true,
              contexts: category ? {
                category: [category]
              } : undefined,
            }
          }
        },
        // Also get matching products for more context
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query,
                  fields: ['name^3', 'brand^2', 'category'],
                  fuzziness: 'AUTO',
                  prefix_length: 1,
                }
              }
            ],
            filter: category ? [{ term: { category } }] : []
          }
        },
        size: limit,
        _source: ['name', 'brand', 'category', 'price', 'image'],
      }
    });

    // Extract suggestions from completion suggester
    const completionSuggestions = response.suggest?.product_suggest?.[0]?.options || [];
    
    // Extract product matches
    const productMatches = response.hits?.hits || [];

    // Combine and deduplicate suggestions
    const suggestionsSet = new Set<string>();
    const suggestions: any[] = [];

    // Add completion suggestions
    completionSuggestions.forEach((option: any) => {
      const text = option.text;
      if (!suggestionsSet.has(text)) {
        suggestionsSet.add(text);
        suggestions.push({
          text,
          type: 'completion',
          score: option._score,
        });
      }
    });

    // Add product-based suggestions
    productMatches.forEach((hit: any) => {
      const product = hit._source;
      
      // Add product name
      if (!suggestionsSet.has(product.name)) {
        suggestionsSet.add(product.name);
        suggestions.push({
          text: product.name,
          type: 'product',
          score: hit._score,
          product: {
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: product.price,
            image: product.image,
          }
        });
      }

      // Add brand if not already included
      if (product.brand && !suggestionsSet.has(product.brand)) {
        suggestionsSet.add(product.brand);
        suggestions.push({
          text: product.brand,
          type: 'brand',
          score: hit._score * 0.8,
        });
      }
    });

    // Sort by score and limit
    suggestions.sort((a, b) => (b.score || 0) - (a.score || 0));
    const limitedSuggestions = suggestions.slice(0, limit);

    return NextResponse.json({
      success: true,
      suggestions: limitedSuggestions,
      query,
      count: limitedSuggestions.length,
    });

  } catch (error: any) {
    console.error('❌ Suggestions API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get suggestions',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}