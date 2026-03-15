// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export { cloudinary };

// Upload a base64 image to Cloudinary and return the result
export async function uploadImage(base64DataUrl: string, folder = 'luminary') {
  const result = await cloudinary.uploader.upload(base64DataUrl, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return {
    cloudinary_id: result.public_id,
    url:           result.secure_url,
    width:         result.width,
    height:        result.height,
  };
}

// Delete an image from Cloudinary by public_id
export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
