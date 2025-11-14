// lib/appwrite.ts
import { Client, Storage, ID } from 'react-native-appwrite';

// Appwrite configuration
const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject('670dcd780032e814bc9c') // Your project ID from Appwrite Console

// Initialize Storage
export const storage = new Storage(client);

// Your bucket ID (create this in Appwrite Console)
export const STORAGE_BUCKET_ID = '670dcf8e000a3813136c'

// Upload image to Appwrite
export const uploadImage = async (fileUri: string, userId: string) => {
  try {
    // Get file info
    const filename = fileUri.split('/').pop() || `image_${Date.now()}.jpg`;
    const fileType = filename.split('.').pop() || 'jpg';
     
    console.log('Uploading file:', filename);
    // Create file object for upload
    const file = {
      name: filename,
      type: `image/${fileType}`,
      size: 0, 
      uri: fileUri,
    };

    // Upload to Appwrite Storage
    const response = await storage.createFile(
      STORAGE_BUCKET_ID,
      ID.unique(), 
      file as any
    );

    console.log('Upload successful:', response);

    // Construct file view URL as string
    const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=670dcd780032e814bc9c`;
    
    console.log('File URL:', fileUrl);

    return {
      success: true,
      fileId: response.$id,
      fileUrl: fileUrl,
      response
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      success: false,
      error: error
    };
  }
};

// Get file preview (optimized for thumbnails)
export const getFilePreview = (fileId: string, width = 400, height = 400) => {
  return `https://cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/preview?project=670dcd780032e814bc9c&width=${width}&height=${height}`;
};

// Get full file view
export const getFileView = (fileId: string) => {
  return `https://cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=670dcd780032e814bc9c`;
};

// Delete file
export const deleteFile = async (fileId: string) => {
  try {
    await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    return { success: true };
  } catch (error) {
    console.error('Delete failed:', error);
    return { success: false, error };
  }
};

// List user's files (optional - if you store metadata in Appwrite Database)
export const listUserFiles = async () => {
  try {
    const response = await storage.listFiles(STORAGE_BUCKET_ID);
    return response.files;
  } catch (error) {
    console.error('List files failed:', error);
    return [];
  }
};