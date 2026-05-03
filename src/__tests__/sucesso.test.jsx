import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams]
  };
});

// Mock CartContext
const mockClearCart = vi.fn();

vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    clearCart: mockClearCart
  })
}));

// Mock AuthContext
let mockUser = { id: 'user-123' };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

// Mock Supabase
let mockOrderData = null;

vi.mock('../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockOrderData, error: null }))
        }))
      }))
    }))
  }
}));

import Sucesso from '../pages/sucesso';

describe('Sucesso Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('orderId');
    mockUser = { id: 'user-123' };
    mockOrderData = null;
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render loading state initially', () => {
    mockSearchParams.set('orderId', 'order-123');
    mockOrderData = { id: 'order-123', status: 'pendente', user_id: 'user-123' };

    renderWithRouter(<Sucesso />);

    expect(screen.getByText('A Verificar Pagamento')).toBeInTheDocument();
  });

  it('should redirect when orderId is missing', async () => {
    mockSearchParams.delete('orderId');

    renderWithRouter(<Sucesso />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should show success when order status is pago', async () => {
    const orderId = 'order-123';
    mockSearchParams.set('orderId', orderId);
    mockOrderData = {
      id: orderId,
      status: 'pago',
      user_id: 'user-123'
    };

    renderWithRouter(<Sucesso />);

    await waitFor(() => {
      expect(screen.getByText('Pagamento Confirmado!')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Obrigado pela sua compra!/)).toBeInTheDocument();
  });
});
