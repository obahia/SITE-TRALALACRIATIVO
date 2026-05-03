import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

// Mock Supabase
vi.mock('../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'cart-1' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signOut: vi.fn()
    },
    storage: {
      from: vi.fn()
    }
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const Wrapper = ({ children }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should add item to cart with correct quantity and customization', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    // Wait for AuthProvider to finish loading
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const product = {
      id: 'prod-1',
      name: 'Caneca Personalizada',
      price: 25.90,
      image_url: 'https://example.com/caneca.jpg'
    };

    const customization = {
      text: 'Feliz Aniversário',
      color: 'blue'
    };

    await act(async () => {
      await result.current.addToCart(product, 2, customization);
    });

    await waitFor(() => {
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0]).toMatchObject({
        id: 'prod-1',
        name: 'Caneca Personalizada',
        price: 25.90,
        quantity: 2,
        customization: {
          text: 'Feliz Aniversário',
          color: 'blue'
        }
      });
    });
  });

  it('should remove item from cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    // Wait for AuthProvider to finish loading
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const product = {
      id: 'prod-1',
      name: 'Caneca',
      price: 25.90,
      image_url: 'test.jpg'
    };

    await act(async () => {
      await result.current.addToCart(product, 1, {});
    });

    await waitFor(() => {
      expect(result.current.cartItems).toHaveLength(1);
    });

    const cartId = result.current.cartItems[0].cartId;

    await act(async () => {
      result.current.removeFromCart(cartId);
    });

    await waitFor(() => {
      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  it('should update quantity of cart item', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    // Wait for AuthProvider to finish loading
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const product = {
      id: 'prod-1',
      name: 'Caneca',
      price: 25.90,
      image_url: 'test.jpg'
    };

    await act(async () => {
      await result.current.addToCart(product, 1, {});
    });

    await waitFor(() => {
      expect(result.current.cartItems[0].quantity).toBe(1);
    });

    const cartId = result.current.cartItems[0].cartId;

    await act(async () => {
      result.current.updateQuantity(cartId, 2);
    });

    await waitFor(() => {
      expect(result.current.cartItems[0].quantity).toBe(3);
    });
  });

  it('should clear all items from cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    // Wait for AuthProvider to finish loading
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const product1 = {
      id: 'prod-1',
      name: 'Caneca',
      price: 25.90,
      image_url: 'test.jpg'
    };

    const product2 = {
      id: 'prod-2',
      name: 'Azulejo',
      price: 15.90,
      image_url: 'test2.jpg'
    };

    await act(async () => {
      await result.current.addToCart(product1, 1, {});
      await result.current.addToCart(product2, 2, {});
    });

    await waitFor(() => {
      expect(result.current.cartItems).toHaveLength(2);
    });

    await act(async () => {
      await result.current.clearCart();
    });

    await waitFor(() => {
      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  it('should calculate cart total correctly with multiple items', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    // Wait for AuthProvider to finish loading
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const product1 = {
      id: 'prod-1',
      name: 'Caneca',
      price: 25.90,
      image_url: 'test.jpg'
    };

    const product2 = {
      id: 'prod-2',
      name: 'Azulejo',
      price: 15.50,
      image_url: 'test2.jpg'
    };

    await act(async () => {
      await result.current.addToCart(product1, 2, {}); // 25.90 * 2 = 51.80
      await result.current.addToCart(product2, 3, {}); // 15.50 * 3 = 46.50
    });

    await waitFor(() => {
      // Total: 51.80 + 46.50 = 98.30
      expect(result.current.cartTotal).toBe(98.30);
      expect(result.current.cartCount).toBe(5);
    });
  });

  it('should open cart when adding item', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    // Wait for AuthProvider to finish loading
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current.isCartOpen).toBe(false);

    const product = {
      id: 'prod-1',
      name: 'Caneca',
      price: 25.90,
      image_url: 'test.jpg'
    };

    await act(async () => {
      await result.current.addToCart(product, 1, {});
    });

    await waitFor(() => {
      expect(result.current.isCartOpen).toBe(true);
    });
  });

  it('should increment quantity when adding same item with same customization', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    // Wait for AuthProvider to finish loading
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const product = {
      id: 'prod-1',
      name: 'Caneca',
      price: 25.90,
      image_url: 'test.jpg'
    };

    const customization = { text: 'Test' };

    await act(async () => {
      await result.current.addToCart(product, 2, customization);
    });

    await waitFor(() => {
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(2);
    });

    await act(async () => {
      await result.current.addToCart(product, 3, customization);
    });

    await waitFor(() => {
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(5);
    });
  });
});
