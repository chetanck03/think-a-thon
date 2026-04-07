import { Router } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Upload file endpoint
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'NO_FILE', message: 'No file uploaded' },
      });
    }

    const file = req.file;
    
    // Determine resource type based on mimetype
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else {
      // For PDFs and other documents, use 'auto' or 'raw'
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    console.log('Uploading file:', file.originalname, 'Type:', resourceType);
    const result = await uploadToCloudinary(
      file.buffer,
      file.originalname,
      resourceType
    );
    console.log('Upload successful. URL:', result.url);

    res.json({
      url: result.url,
      publicId: result.publicId,
      resourceType: result.resourceType,
      format: result.format,
      size: result.size,
      width: result.width,
      height: result.height,
      duration: result.duration,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error details:', error.message, error.http_code);
    res.status(500).json({
      error: { 
        code: 'UPLOAD_FAILED', 
        message: 'Failed to upload file',
        details: error.message 
      },
    });
  }
});

export default router;
