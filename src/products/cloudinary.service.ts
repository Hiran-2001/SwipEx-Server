import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret && cloudName !== 'mock_cloud_name') {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary configured successfully.');
    } else {
      this.logger.warn('Cloudinary not configured or using mock values. Using mock uploads.');
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.isConfigured) {
      this.logger.log('Mock upload: returning placeholder image URL');
      const mockId = Math.floor(Math.random() * 1000) + 1;
      return `https://picsum.photos/id/${mockId}/800/600`;
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'secondspin' },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload failed, falling back to mock: ', error || 'no result');
            const mockId = Math.floor(Math.random() * 1000) + 1;
            resolve(`https://picsum.photos/id/${mockId}/800/600`);
          } else {
            resolve(result.secure_url);
          }
        },
      );
      upload.end(file.buffer);
    });
  }
}
