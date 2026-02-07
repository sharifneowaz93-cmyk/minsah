import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock cart data - replace with database calls
interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  variant?: {
    color?: string;
    size?: string;
    scent?: string;
  };
  inStock: boolean;
}

interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// Mock storage - replace with database
const mockCarts = new Map<string, Cart>();

export async function GET(request: NextRequest) {
  try {
    // Get cart ID from cookies or user session
    const cartId = request.cookies.get('cart_id')?.value;
    const userId = request.cookies.get('user_id')?.value;

    if (!cartId && !userId) {
      // Return empty cart for guest users
      return NextResponse.json({
        cart: {
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
          currency: 'BDT'
        }
      });
    }

    // Get cart from storage (in production, this would be from database)
    let cart = cartId ? mockCarts.get(cartId) : null;

    // If no cart found, create empty cart
    if (!cart) {
      cart = {
        id: cartId || `cart_${Date.now()}`,
        userId: userId || undefined,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        currency: 'BDT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    return NextResponse.json({ cart });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, variant } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get cart ID from cookies or create new one
    let cartId = request.cookies.get('cart_id')?.value;
    if (!cartId) {
      cartId = `cart_${Date.now()}`;
    }

    // Get or create cart
    let cart = mockCarts.get(cartId) || {
      id: cartId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      currency: 'BDT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Mock product data (in production, fetch from database)
    const mockProducts = {
      '1': {
        id: '1',
        name: 'Premium Foundation',
        slug: 'premium-foundation',
        price: 2500,
        originalPrice: 3000,
        image: '/images/products/foundation-1.jpg',
        inStock: true
      },
      '2': {
        id: '2',
        name: 'Hydrating Face Serum',
        slug: 'hydrating-face-serum',
        price: 1800,
        originalPrice: 2200,
        image: '/images/products/serum-1.jpg',
        inStock: true
      }
    };

    const product = mockProducts[productId as keyof typeof mockProducts];
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        id: `item_${Date.now()}`,
        productId,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        quantity,
        variant,
        inStock: product.inStock
      });
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.tax = Math.round(cart.subtotal * 0.05); // 5% tax
    cart.shipping = cart.subtotal >= 5000 ? 0 : 100; // Free shipping over 5000 BDT
    cart.total = cart.subtotal + cart.tax + cart.shipping;
    cart.updatedAt = new Date().toISOString();

    // Save cart
    mockCarts.set(cartId, cart);

    // Set cart ID cookie
    const response = NextResponse.json({ cart });
    response.cookies.set('cart_id', cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 }
      );
    }

    const cartId = request.cookies.get('cart_id')?.value;
    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const cart = mockCarts.get(cartId);
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Find and update item
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.tax = Math.round(cart.subtotal * 0.05);
    cart.shipping = cart.subtotal >= 5000 ? 0 : 100;
    cart.total = cart.subtotal + cart.tax + cart.shipping;
    cart.updatedAt = new Date().toISOString();

    // Save cart
    mockCarts.set(cartId, cart);

    return NextResponse.json({ cart });

  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const cartId = request.cookies.get('cart_id')?.value;
    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const cart = mockCarts.get(cartId);
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    if (itemId) {
      // Remove specific item
      cart.items = cart.items.filter(item => item.id !== itemId);
    } else {
      // Clear entire cart
      cart.items = [];
    }

    // Recalculate totals
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.total = 0;
    cart.updatedAt = new Date().toISOString();

    // Save cart
    mockCarts.set(cartId, cart);

    return NextResponse.json({ cart });

  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
