import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();

vi.mock('../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect
    }))
  }
}));

import { useProducts, useProduct } from '../hooks/useProducts';
import { supabase as mockSupabase } from '../services/supabase';

describe('useProducts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProducts', () => {
    it('should fetch and return products array', async () => {
      const mockProducts = [
        { id: 1, name: 'Caneca', price: 25.90, is_active: true },
        { id: 2, name: 'Azulejo', price: 15.50, is_active: true }
      ];

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue({
        data: mockProducts,
        error: null
      });

      const { result } = renderHook(() => useProducts());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('is_active', true);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.error).toBeNull();
    });

    it('should filter by is_active true', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      renderHook(() => useProducts());

      await waitFor(() => {
        expect(mockEq).toHaveBeenCalledWith('is_active', true);
      });
    });

    it('should handle loading and error states', async () => {
      const mockError = new Error('Database error');

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue({
        data: null,
        error: mockError
      });

      const { result } = renderHook(() => useProducts());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe('Database error');
    });

    it('should apply limit option when provided', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockReturnValue({
        limit: mockLimit
      });

      mockLimit.mockResolvedValue({
        data: [],
        error: null
      });

      renderHook(() => useProducts({ limit: 5 }));

      await waitFor(() => {
        expect(mockLimit).toHaveBeenCalledWith(5);
      });
    });

    it('should use custom orderBy and ascending options', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValue({
        order: mockOrder
      });

      mockOrder.mockResolvedValue({
        data: [],
        error: null
      });

      renderHook(() => useProducts({ orderBy: 'name', ascending: true }));

      await waitFor(() => {
        expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      });
    });
  });

  describe('useProduct', () => {
    it('should fetch single product by id', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Caneca Personalizada',
        price: 25.90,
        is_active: true
      };

      mockSelect.mockReturnValue({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockSingle
          }))
        }))
      });

      mockSingle.mockResolvedValue({
        data: mockProduct,
        error: null
      });

      const { result } = renderHook(() => useProduct('prod-1'));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result.current.product).toEqual(mockProduct);
      expect(result.current.error).toBeNull();
    });

    it('should filter by is_active true for single product', async () => {
      const mockEqIsActive = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSingle
        }))
      }));

      mockSelect.mockReturnValue({
        eq: mockEqIsActive
      });

      mockSingle.mockResolvedValue({
        data: { id: 'prod-1', is_active: true },
        error: null
      });

      renderHook(() => useProduct('prod-1'));

      await waitFor(() => {
        expect(mockEqIsActive).toHaveBeenCalledWith('is_active', true);
      });
    });

    it('should handle error state for single product', async () => {
      const mockError = new Error('Product not found');

      mockSelect.mockReturnValue({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockSingle
          }))
        }))
      });

      mockSingle.mockResolvedValue({
        data: null,
        error: mockError
      });

      const { result } = renderHook(() => useProduct('invalid-id'));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.product).toBeNull();
      expect(result.current.error).toBe('Product not found');
    });

    it('should not fetch when id is null or undefined', async () => {
      const { result } = renderHook(() => useProduct(null));

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should refetch when id changes', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockSingle
          }))
        }))
      });

      mockSingle.mockResolvedValue({
        data: { id: 'prod-1' },
        error: null
      });

      const { rerender } = renderHook(
        ({ id }) => useProduct(id),
        { initialProps: { id: 'prod-1' } }
      );

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      });

      mockSingle.mockResolvedValue({
        data: { id: 'prod-2' },
        error: null
      });

      rerender({ id: 'prod-2' });

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledTimes(2);
      });
    });
  });
});
