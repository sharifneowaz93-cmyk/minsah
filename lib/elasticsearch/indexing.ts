import { esClient, PRODUCT_INDEX, productIndexMapping, indexExists } from '@/lib/elasticsearch';
import prisma from '@/lib/prisma';

// Create product index if not exists
export async function createProductIndex() {
  try {
    const exists = await indexExists(PRODUCT_INDEX);
    
    if (exists) {
      console.log(`✅ Index ${PRODUCT_INDEX} already exists`);
      return true;
    }

    await esClient.indices.create({
      index: PRODUCT_INDEX,
      body: productIndexMapping,
    });
    
    console.log(`✅ Index ${PRODUCT_INDEX} created successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error creating index:', error);
    return false;
  }
}

// Transform product for Elasticsearch
function transformProductForES(product: any) {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    brand: product.brand || '',
    category: product.category || '',
    subcategory: product.subcategory || '',
    price: parseFloat(product.price?.toString() || '0'),
    originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : null,
    discount: product.discount || 0,
    stock: product.stock || 0,
    inStock: (product.stock || 0) > 0,
    rating: product.rating ? parseFloat(product.rating.toString()) : 0,
    reviewCount: product.reviewCount || 0,
    image: product.image || '',
    images: product.images || [],
    sku: product.sku || '',
    tags: product.tags || [],
    ingredients: product.ingredients || '',
    isFeatured: product.isFeatured || false,
    isNewArrival: product.isNewArrival || false,
    isFlashSale: product.isFlashSale || false,
    isFavourite: product.isFavourite || false,
    isRecommended: product.isRecommended || false,
    isForYou: product.isForYou || false,
    createdAt: product.createdAt || new Date(),
    updatedAt: product.updatedAt || new Date(),
  };
}

// Index a single product
export async function indexProduct(product: any) {
  try {
    const transformedProduct = transformProductForES(product);
    
    await esClient.index({
      index: PRODUCT_INDEX,
      id: product.id,
      document: transformedProduct,
    });
    
    // Refresh to make changes immediately searchable
    await esClient.indices.refresh({ index: PRODUCT_INDEX });
    
    console.log(`✅ Product ${product.id} indexed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error indexing product ${product.id}:`, error);
    return false;
  }
}

// Update a product in the index
export async function updateProduct(productId: string, updates: any) {
  try {
    await esClient.update({
      index: PRODUCT_INDEX,
      id: productId,
      doc: updates,
    });
    
    await esClient.indices.refresh({ index: PRODUCT_INDEX });
    
    console.log(`✅ Product ${productId} updated successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating product ${productId}:`, error);
    return false;
  }
}

// Delete a product from index
export async function deleteProduct(productId: string) {
  try {
    await esClient.delete({
      index: PRODUCT_INDEX,
      id: productId,
    });
    
    console.log(`✅ Product ${productId} deleted from index`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting product ${productId}:`, error);
    return false;
  }
}

// Bulk index all products from database
export async function indexAllProducts() {
  try {
    console.log('📊 Fetching products from database...');
    
    // Get all visible products from Prisma
    const products = await prisma.product.findMany({
      where: { isVisible: true },
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        category: true,
        subcategory: true,
        price: true,
        originalPrice: true,
        discount: true,
        stock: true,
        rating: true,
        reviewCount: true,
        image: true,
        images: true,
        sku: true,
        tags: true,
        ingredients: true,
        isFeatured: true,
        isNewArrival: true,
        isFlashSale: true,
        isFavourite: true,
        isRecommended: true,
        isForYou: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (products.length === 0) {
      console.log('⚠️ No products found to index');
      return true;
    }

    console.log(`📦 Found ${products.length} products to index`);

    // Prepare bulk operations
    const operations = products.flatMap(product => {
      const transformedProduct = transformProductForES(product);
      return [
        { index: { _index: PRODUCT_INDEX, _id: product.id } },
        transformedProduct,
      ];
    });

    // Execute bulk indexing
    const response = await esClient.bulk({ 
      operations,
      refresh: true 
    });
    
    if (response.errors) {
      const erroredDocuments = response.items.filter((item: any) => item.index?.error);
      console.error('❌ Bulk indexing had errors:', erroredDocuments);
      return false;
    }

    console.log(`✅ Successfully indexed ${products.length} products`);
    
    // Get index stats
    const stats = await esClient.count({ index: PRODUCT_INDEX });
    console.log(`📊 Total documents in index: ${stats.count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error bulk indexing products:', error);
    return false;
  }
}

// Reindex all products (delete and recreate)
export async function reindexAllProducts() {
  try {
    console.log('🔄 Starting reindex process...');
    
    // Check if index exists
    const exists = await indexExists(PRODUCT_INDEX);
    
    if (exists) {
      console.log('🗑️ Deleting existing index...');
      await esClient.indices.delete({ index: PRODUCT_INDEX });
    }
    
    // Create fresh index
    console.log('📦 Creating new index...');
    await createProductIndex();
    
    // Index all products
    console.log('📊 Indexing products...');
    await indexAllProducts();
    
    console.log('✅ Reindex completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error reindexing products:', error);
    return false;
  }
}

// Search products (basic wrapper)
export async function searchProducts(query: string, options: any = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort = 'relevance'
    } = options;

    const must: any[] = [];
    const filter: any[] = [];

    // Build search query
    if (query) {
      must.push({
        multi_match: {
          query: query,
          fields: [
            'name^3',
            'brand^2',
            'description',
            'category',
            'tags',
            'ingredients'
          ],
          fuzziness: 'AUTO',
        }
      });
    } else {
      must.push({ match_all: {} });
    }

    // Apply filters
    if (category) {
      filter.push({ term: { category } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const range: any = {};
      if (minPrice !== undefined) range.gte = minPrice;
      if (maxPrice !== undefined) range.lte = maxPrice;
      filter.push({ range: { price: range } });
    }

    if (inStock) {
      filter.push({ term: { inStock: true } });
    }

    // Determine sort order
    let sortOrder: any[] = [{ _score: 'desc' }];
    
    if (sort === 'price_asc') {
      sortOrder = [{ price: 'asc' }];
    } else if (sort === 'price_desc') {
      sortOrder = [{ price: 'desc' }];
    } else if (sort === 'newest') {
      sortOrder = [{ createdAt: 'desc' }];
    } else if (sort === 'rating') {
      sortOrder = [{ rating: 'desc' }];
    }

    const response = await esClient.search({
      index: PRODUCT_INDEX,
      from: (page - 1) * limit,
      size: limit,
      body: {
        query: {
          bool: {
            must,
            filter,
          }
        },
        sort: sortOrder,
        highlight: {
          fields: {
            name: {},
            description: {},
          }
        }
      }
    });

    const hits = response.hits.hits;
    const products = hits.map((hit: any) => ({
      ...hit._source,
      _score: hit._score,
      _highlights: hit.highlight,
    }));

    return {
      products,
      total: typeof response.hits.total === 'object' 
        ? response.hits.total.value 
        : response.hits.total,
      page,
      limit,
      totalPages: Math.ceil(
        (typeof response.hits.total === 'object' 
          ? response.hits.total.value 
          : response.hits.total) / limit
      ),
    };
  } catch (error) {
    console.error('❌ Search error:', error);
    throw error;
  }
}