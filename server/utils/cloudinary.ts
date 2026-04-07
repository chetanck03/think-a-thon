import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'image'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // Extract file extension
    const fileExtension = fileName.split('.').pop() || '';
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Sanitize filename - remove spaces and special characters
    const sanitizedName = fileNameWithoutExt
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, '')  // Remove special characters
      .toLowerCase();
    
    const uploadOptions: any = {
      resource_type: resourceType,
      folder: 'startupops-chat',
      public_id: `${Date.now()}-${sanitizedName}`,
      // For raw files, use the original extension
      use_filename: false,
      unique_filename: false,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
}

export { cloudinary };
