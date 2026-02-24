import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload file
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'construction-docs'
): Promise<{
  url: string;
  cloudinaryId: string;
  format: string;
  size: number;
}> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'sustain/' + folder,
      resource_type: 'auto',
    });

    return {
      url: result.secure_url,
      cloudinaryId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Helper function to delete file
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};
