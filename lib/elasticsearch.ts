import { Client } from '@elastic/elasticsearch';

// Elasticsearch client configuration
export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200',
  auth: {
    username: 'elastic',
    password: process.env.ELASTIC_PASSWORD || '',
  },
  // For development without SSL
  tls: {
    rejectUnauthorized: false,
  },
});

// Test connection
export async function testConnection() {
  try {
    const health = await esClient.cluster.health();
    console.log('✅ Elasticsearch connected:', health.status);
    return true;
  } catch (error) {
    console.error('❌ Elasticsearch connection failed:', error);
    return false;
  }
}

// Index name
export const PRODUCT_INDEX = 'products';

// Product index mapping with optimized settings
export const productIndexMapping = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    analysis: {
      analyzer: {
        autocomplete: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'autocomplete_filter']
        },
        autocomplete_search: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase']
        }
      },
      filter: {
        autocomplete_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20
        }
      }
    }
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      name: { 
        type: 'text',
        analyzer: 'autocomplete',
        search_analyzer: 'autocomplete_search',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { 
            type: 'completion',
            contexts: [
              {
                name: 'category',
                type: 'category'
              }
            ]
          }
        }
      },
      description: { 
        type: 'text',
        analyzer: 'standard'
      },
      brand: { 
        type: 'text',
        fields: { 
          keyword: { type: 'keyword' }
        }
      },
      category: { type: 'keyword' },
      subcategory: { type: 'keyword' },
      price: { type: 'float' },
      originalPrice: { type: 'float' },
      discount: { type: 'integer' },
      stock: { type: 'integer' },
      inStock: { type: 'boolean' },
      rating: { type: 'float' },
      reviewCount: { type: 'integer' },
      image: { type: 'keyword' },
      images: { type: 'keyword' },
      sku: { type: 'keyword' },
      tags: { type: 'keyword' },
      ingredients: { type: 'text' },
      isFeatured: { type: 'boolean' },
      isNewArrival: { type: 'boolean' },
      isFlashSale: { type: 'boolean' },
      isFavourite: { type: 'boolean' },
      isRecommended: { type: 'boolean' },
      isForYou: { type: 'boolean' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    }
  }
};

// Helper function to check if index exists
export async function indexExists(indexName: string): Promise<boolean> {
  try {
    const exists = await esClient.indices.exists({ index: indexName });
    return exists;
  } catch (error) {
    console.error('Error checking index existence:', error);
    return false;
  }
}

// Helper function to delete index
export async function deleteIndex(indexName: string): Promise<boolean> {
  try {
    await esClient.indices.delete({ index: indexName });
    console.log(`Index ${indexName} deleted`);
    return true;
  } catch (error) {
    console.error('Error deleting index:', error);
    return false;
  }
}

// Get index stats
export async function getIndexStats(indexName: string) {
  try {
    const stats = await esClient.indices.stats({ index: indexName });
    return stats;
  } catch (error) {
    console.error('Error getting index stats:', error);
    return null;
  }
}