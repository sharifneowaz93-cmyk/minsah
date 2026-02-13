import { Client } from '@elastic/elasticsearch';

let esClient: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!esClient) {
    esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme123'
      }
    });

    // Auto-create index on first connection
    initializeIndex();
  }

  return esClient;
}

async function initializeIndex() {
  if (!esClient) return;

  try {
    const exists = await esClient.indices.exists({ index: 'products' });

    if (!exists) {
      await esClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text' },
              description: { type: 'text' },
              category: { type: 'keyword' },
              brand: { type: 'keyword' },
              price: { type: 'float' },
              inStock: { type: 'boolean' }
            }
          }
        }
      });
      console.log('✅ Products index created');
    }
  } catch (error) {
    console.error('Elasticsearch error:', error);
  }
}

// Search products
export async function searchProducts(query: string) {
  const client = getElasticsearchClient();

  try {
    const result = await client.search({
      index: 'products',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name^3', 'description', 'brand', 'category']
          }
        }
      }
    });

    return result.hits.hits.map((hit: any) => hit._source);
  } catch (error) {
    console.error('Search error:', error);
    return [];
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
        inStock: product.inStock
      }
    });
  } catch (error) {
    console.error('Index error:', error);
  }
}
