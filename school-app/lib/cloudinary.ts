import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder = 'kareli-bagh-school',
  originalFilename = 'upload.jpg'
): Promise<{ url: string; publicId?: string; isLocal: boolean }> {
  // If Cloudinary is configured, upload to Cloudinary
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            // Fallback to local save
            resolve(saveLocally(buffer, originalFilename));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              isLocal: false,
            });
          } else {
            resolve(saveLocally(buffer, originalFilename));
          }
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local fallback: save to public/uploads
  return saveLocally(buffer, originalFilename);
}

function saveLocally(buffer: Buffer, originalFilename: string): { url: string; isLocal: boolean } {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalFilename) || '.jpg';
  const cleanName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `${Date.now()}-${cleanName || 'image'}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, buffer);
  return {
    url: `/uploads/${fileName}`,
    isLocal: true,
  };
}

export function isCloudinaryActive(): boolean {
  return isCloudinaryConfigured;
}
