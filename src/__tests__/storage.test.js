import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase first
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockRemove = vi.fn();

vi.mock('../services/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove
      }))
    }
  }
}));

import { uploadCustomizationImage, getImageUrl, deleteImage } from '../services/storage';
import { supabase as mockSupabase } from '../services/supabase';

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadCustomizationImage', () => {
    it('should upload image and return path and public URL', async () => {
      const mockFile = new File(['content'], 'test-image.jpg', { type: 'image/jpeg' });
      const userId = 'user-123';
      const mockPath = `${userId}/123456-test-image.jpg`;
      const mockPublicUrl = `https://storage.supabase.co/bucket/${mockPath}`;

      mockUpload.mockResolvedValue({
        data: { path: mockPath },
        error: null
      });

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl }
      });

      const result = await uploadCustomizationImage(mockFile, userId);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('customization-images');
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^${userId}/\\d+-test-image\\.jpg$`)),
        mockFile
      );
      expect(result.data).toEqual({
        path: mockPath,
        publicUrl: mockPublicUrl
      });
      expect(result.error).toBeNull();
    });

    it('should return error when file is missing', async () => {
      const result = await uploadCustomizationImage(null, 'user-123');

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('File and userId are required');
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should return error when userId is missing', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await uploadCustomizationImage(mockFile, null);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('File and userId are required');
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should return error when upload fails', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new Error('Upload failed');

      mockUpload.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await uploadCustomizationImage(mockFile, 'user-123');

      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });

    it('should create unique file path with timestamp', async () => {
      const mockFile = new File(['content'], 'my-image.png', { type: 'image/png' });
      const userId = 'user-456';
      
      mockUpload.mockResolvedValue({
        data: { path: 'some/path' },
        error: null
      });

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/url' }
      });

      const beforeTime = Date.now();
      await uploadCustomizationImage(mockFile, userId);
      const afterTime = Date.now();

      const uploadCall = mockUpload.mock.calls[0][0];
      expect(uploadCall).toMatch(new RegExp(`^${userId}/\\d+-my-image\\.png$`));
      
      // Extract timestamp from path
      const timestamp = parseInt(uploadCall.split('/')[1].split('-')[0]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('getImageUrl', () => {
    it('should return public URL for given path', () => {
      const path = 'user-123/image.jpg';
      const mockPublicUrl = `https://storage.supabase.co/bucket/${path}`;

      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: mockPublicUrl }
      });

      const url = getImageUrl(path);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('customization-images');
      expect(mockGetPublicUrl).toHaveBeenCalledWith(path);
      expect(url).toBe(mockPublicUrl);
    });
  });

  describe('deleteImage', () => {
    it('should call remove with correct path', async () => {
      const path = 'user-123/12345-image.jpg';

      mockRemove.mockResolvedValue({
        data: { success: true },
        error: null
      });

      const result = await deleteImage(path);

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('customization-images');
      expect(mockRemove).toHaveBeenCalledWith([path]);
      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
    });

    it('should return error when delete fails', async () => {
      const path = 'user-123/image.jpg';
      const mockError = new Error('Delete failed');

      mockRemove.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await deleteImage(path);

      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
    });
  });
});
