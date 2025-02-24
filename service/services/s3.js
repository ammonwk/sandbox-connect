// services/s3.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Configure the S3 client
const s3Client = new S3Client({
  region: config.aws.region
});

const S3_BUCKET = config.aws.s3.bucketName;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export const uploadFile = async (file) => {
  try {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const key = `profile-pictures/${uuidv4()}.${fileExtension}`;
    
    // Validate file type
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    if (!allowedTypes.includes(fileExtension)) {
      throw new Error('Invalid file type. Only jpg, jpeg, png, and gif are allowed.');
    }
    
    let fileBuffer = file.buffer;
    let contentType = file.mimetype;
    
    // Process image if necessary
    if (fileBuffer.length > MAX_FILE_SIZE && ['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      logger.info('Resizing large image before upload', { size: fileBuffer.length, filename: file.originalname });
      fileBuffer = await resizeImage(fileBuffer, fileExtension);
      contentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
    }
    
    // Configure upload parameters
    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    };
    
    // Upload to S3
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Return URL of uploaded file
    const fileUrl = `https://${S3_BUCKET}.s3.${config.aws.region}.amazonaws.com/${key}`;
    logger.info('File uploaded successfully', { fileUrl });
    
    return fileUrl;
  } catch (error) {
    logger.error('S3 upload error', { error: error.message });
    throw error;
  }
};

// Helper function to resize images
async function resizeImage(buffer, format) {
  try {
    let sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();
    
    // Calculate dimensions while maintaining aspect ratio
    const aspectRatio = metadata.width / metadata.height;
    let width, height;
    
    if (aspectRatio > 1) {
      // Landscape image
      width = Math.min(400, metadata.width);
      height = Math.round(width / aspectRatio);
    } else {
      // Portrait or square image
      height = Math.min(400, metadata.height);
      width = Math.round(height * aspectRatio);
    }
    
    // Resize image
    sharpInstance = sharpInstance.resize(width, height);
    
    // Apply compression based on format
    if (format === 'jpg' || format === 'jpeg') {
      return await sharpInstance.jpeg({ quality: 80 }).toBuffer();
    } else if (format === 'png') {
      return await sharpInstance.png({ compressionLevel: 8 }).toBuffer();
    } else {
      return await sharpInstance.toBuffer();
    }
  } catch (error) {
    logger.error('Image processing error', { error: error.message });
    throw error;
  }
}