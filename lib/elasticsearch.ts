import { Client } from '@elastic/elasticsearch';

let esClient: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!esClient) {
    // Use Docker internal network name
    const node = process.env.ELASTICSEARCH_URL || 'http://minsah-elasticsearch:9200';
    const password = process.env.ELASTICSEARCH_PASSWORD;

    if (!password) {
      throw new Error('ELASTICSEARCH_PASSWORD is not set');
    }

    esClient = new Client({
      node,
      auth: {
        username: 'elastic',
        password
      },
      maxRetries: 3,
      requestTimeout: 30000
    });

    // Test connection
    esClient.ping()
      .then(() => console.log('✅ Elasticsearch connected'))
      .catch(err => console.error('❌ Elasticsearch connection failed:', err.message));
  }

  return esClient;
}

// Search products
export async function searchProducts(query: string, page = 1, limit = 20) {
  const client = getElasticsearchClient();

  try {
    const result = await client.search({
      index: 'products',
      from: (page - 1) * limit,
      size: limit,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name^3', 'description', 'brand^2', 'category', 'tags'],
            fuzziness: 'AUTO'
          }
        },
        sort: [
          { _score: 'desc' },
          { rating: 'desc' }
        ]
      }
    });

    return {
      products: result.hits.hits.map((hit: any) => hit._source),
      total: result.hits.total.value,
      page,
      hasMore: result.hits.total.value > page * limit
    };
  } catch (error: any) {
    console.error('Search error:', error.message);
    return { products: [], total: 0, page, hasMore: false };
  }
}

// Index a product
export async function indexProduct(product: any) {
  const client = getElasticsearchClient();

  try {
    await client.index({
      index: 'products',
      id: product.id,
      document: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        price: product.price,
        inStock: product.inStock,
        image: product.image,
        tags: product.tags,
        rating: product.rating,
        createdAt: product.createdAt
      }
    });

    console.log(`✅ Indexed product: ${product.name}`);
  } catch (error: any) {
    console.error(`❌ Failed to index product:`, error.message);
  }
}

// Bulk index products
export async function bulkIndexProducts(products: any[]) {
  const client = getElasticsearchClient();

  try {
    const operations = products.flatMap(product => [
      { index: { _index: 'products', _id: product.id } },
      {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        price: product.price,
        inStock: product.inStock,
        image: product.image,
        tags: product.tags,
        rating: product.rating,
        createdAt: product.createdAt
      }
    ]);

    const result = await client.bulk({ operations, refresh: true });

    if (result.errors) {
      console.error('❌ Some products failed to index');
    } else {
      console.log(`✅ Indexed ${products.length} products`);
    }

    return { success: !result.errors, count: products.length };
  } catch (error: any) {
    console.error('❌ Bulk index failed:', error.message);
    return { success: false, count: 0 };
  }
}

// Delete product
export async function deleteProduct(productId: string) {
  const client = getElasticsearchClient();

  try {
    await client.delete({
      index: 'products',
      id: productId
    });

    console.log(`✅ Deleted product: ${productId}`);
  } catch (error: any) {
    console.error(`❌ Failed to delete product:`, error.message);
  }
}
