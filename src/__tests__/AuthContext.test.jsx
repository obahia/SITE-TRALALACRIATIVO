import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock Supabase
vi.mock('../services/supabase', () => ({
  supabase: {
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
    }
  }
}));

import { supabase as mockSupabase } from '../services/supabase';

const Wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });
  });

  it('should initialize with no user and loading false after session check', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should call signInWithPassword with correct credentials', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const mockData = { user: mockUser, session: { access_token: 'token' } };
    
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: mockData,
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(signInResult).toEqual(mockData);
  });

  it('should call signUp with email, password, and metadata', async () => {
    const mockData = { user: { id: 'user-1', email: 'new@example.com' } };
    
    mockSupabase.auth.signUp.mockResolvedValue({
      data: mockData,
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp(
        'new@example.com',
        'password123',
        'John',
        'Doe'
      );
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'John',
          last_name: 'Doe',
          full_name: 'John Doe'
        }
      }
    });
    expect(signUpResult).toEqual(mockData);
  });

  it('should call signInWithOAuth for Google login', async () => {
    const mockData = { url: 'https://google.oauth.url' };
    
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: mockData,
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let oauthResult;
    await act(async () => {
      oauthResult = await result.current.signInWithGoogle();
    });

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    expect(oauthResult).toEqual(mockData);
  });

  it('should call resetPasswordForEmail with correct email', async () => {
    const mockData = { success: true };
    
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
      data: mockData,
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let resetResult;
    await act(async () => {
      resetResult = await result.current.resetPassword('reset@example.com');
    });

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'reset@example.com',
      { redirectTo: window.location.origin }
    );
    expect(resetResult).toEqual(mockData);
  });

  it('should call signOut when logout is invoked', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle login modal state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isLoginModalOpen).toBe(false);

    act(() => {
      result.current.setIsLoginModalOpen(true);
    });

    expect(result.current.isLoginModalOpen).toBe(true);

    act(() => {
      result.current.setIsLoginModalOpen(false);
    });

    expect(result.current.isLoginModalOpen).toBe(false);
  });

  it('should throw error when signIn fails', async () => {
    const mockError = new Error('Invalid credentials');
    
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: mockError
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signIn('wrong@example.com', 'wrongpassword');
      });
    }).rejects.toThrow('Invalid credentials');
  });

  it('should update user when onAuthStateChange fires', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    let authCallback;

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      };
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();

    // Simulate auth state change
    act(() => {
      authCallback('SIGNED_IN', { user: mockUser });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });
});
