import { NextRequest, NextResponse } from 'next/server';
import { esClient, PRODUCT_INDEX } from '@/lib/elasticsearch';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock') === 'true';
    const brand = searchParams.get('brand');
    const rating = searchParams.get('rating');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'relevance';

    // Build Elasticsearch query
    const must: any[] = [];
    const filter: any[] = [];
    const should: any[] = [];

    // Main search query with multi-field matching
    if (query.trim()) {
      must.push({
        multi_match: {
          query: query,
          fields: [
            'name^5',           // Highest priority
            'brand^3',          // High priority
            'category^2',       // Medium priority
            'description^1.5',  // Medium priority
            'tags^2',           // Medium priority
            'ingredients',      // Lower priority
            'sku',             // Lower priority
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
          prefix_length: 2,
        }
      });

      // Boost exact matches
      should.push({
        match_phrase: {
          name: {
            query: query,
            boost: 3,
          }
        }
      });
    } else {
      must.push({ match_all: {} });
    }

    // Category filter
    if (category) {
      filter.push({ term: { category } });
    }

    // Subcategory filter
    if (subcategory) {
      filter.push({ term: { subcategory } });
    }

    // Brand filter
    if (brand) {
      filter.push({ term: { 'brand.keyword': brand } });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      const priceRange: any = {};
      if (minPrice) priceRange.gte = parseFloat(minPrice);
      if (maxPrice) priceRange.lte = parseFloat(maxPrice);
      filter.push({ range: { price: priceRange } });
    }

    // Stock filter
    if (inStock) {
      filter.push({ term: { inStock: true } });
    }

    // Rating filter
    if (rating) {
      filter.push({ 
        range: { 
          rating: { 
            gte: parseFloat(rating) 
          } 
        } 
      });
    }

    // Tags filter
    if (tags && tags.length > 0) {
      filter.push({
        terms: { tags }
      });
    }

    // Determine sort order
    let sortOrder: any[] = [];
    
    switch (sort) {
      case 'price_asc':
        sortOrder = [{ price: 'asc' }, { _score: 'desc' }];
        break;
      case 'price_desc':
        sortOrder = [{ price: 'desc' }, { _score: 'desc' }];
        break;
      case 'newest':
        sortOrder = [{ createdAt: 'desc' }, { _score: 'desc' }];
        break;
      case 'rating':
        sortOrder = [{ rating: 'desc' }, { _score: 'desc' }];
        break;
      case 'name_asc':
        sortOrder = [{ 'name.keyword': 'asc' }];
        break;
      case 'name_desc':
        sortOrder = [{ 'name.keyword': 'desc' }];
        break;
      case 'relevance':
      default:
        sortOrder = [{ _score: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    // Execute search
    const response = await esClient.search({
  index: PRODUCT_INDEX,
  query: {
    bool: {
      must,
      filter,
      should,
      minimum_should_match: should.length > 0 ? 0 : undefined,
    }
  },
  from: (page - 1) * limit,
  size: limit,
  sort: sortOrder,
  highlight: {
    fields: {
      name: {
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      },
      description: {
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
        fragment_size: 150,
        number_of_fragments: 3,
      },
    }
  },
  aggs: {
    categories: {
      terms: { field: 'category', size: 20 }
    },
    brands: {
      terms: { field: 'brand.keyword', size: 20 }
    },
    price_ranges: {
      range: {
        field: 'price',
        ranges: [
          { key: 'Under 500', to: 500 },
          { key: '500-1000', from: 500, to: 1000 },
          { key: '1000-2000', from: 1000, to: 2000 },
          { key: '2000-5000', from: 2000, to: 5000 },
          { key: 'Over 5000', from: 5000 },
        ]
      }
    },
    avg_price: { avg: { field: 'price' } },
    min_price: { min: { field: 'price' } },
    max_price: { max: { field: 'price' } },
  }
    });

    const hits = response.hits.hits;
    const products = hits.map((hit: any) => ({
      ...hit._source,
      _score: hit._score,
      _highlights: hit.highlight,
    }));

    const total = typeof response.hits.total === 'object' 
      ? response.hits.total.value 
      : response.hits.total;

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
        aggregations: {
          categories: response.aggregations?.categories,
          brands: response.aggregations?.brands,
          priceRanges: response.aggregations?.price_ranges,
          priceStats: {
            avg: response.aggregations?.avg_price?.value,
            min: response.aggregations?.min_price?.value,
            max: response.aggregations?.max_price?.value,
          }
        },
        query: {
          searchTerm: query,
          filters: {
            category,
            subcategory,
            brand,
            minPrice,
            maxPrice,
            inStock,
            rating,
            tags,
          },
          sort,
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Search API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Search failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}