// src/services/storage.js
import { supabase } from './supabase';

const BUCKET_NAME = 'customization-images';

/**
 * Upload a customization image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<{data: {path: string, publicUrl: string}, error: null} | {data: null, error: Error}>}
 */
export async function uploadCustomizationImage(file, userId) {
  if (!file || !userId) {
    return { 
      data: null, 
      error: new Error('File and userId are required') 
    };
  }

  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}-${file.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    data: {
      path: uploadData.path,
      publicUrl: urlData.publicUrl
    },
    error: null
  };
}

/**
 * Get the public URL for an uploaded image
 * @param {string} path - The storage path of the image
 * @returns {string} The public URL
 */
export function getImageUrl(path) {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Delete an image from storage
 * @param {string} path - The storage path of the image to delete
 * @returns {Promise<{data: any, error: Error | null}>}
 */
export async function deleteImage(path) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  return { data, error };
}
