const sharp = require('sharp');

// Image optimization utility
class ImageOptimizer {
  // Generate thumbnail from base64 image
  static async generateThumbnail(base64Image, width = 300, height = 200, quality = 80) {
    try {
      // Remove data URL prefix
      const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate thumbnail
      const thumbnail = await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toBuffer();
      
      // Convert back to base64
      return `data:image/jpeg;base64,${thumbnail.toString('base64')}`;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return base64Image; // Return original if optimization fails
    }
  }

  // Optimize full-size image
  static async optimizeImage(base64Image, quality = 85) {
    try {
      const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const optimized = await sharp(buffer)
        .jpeg({ quality })
        .toBuffer();
      
      return `data:image/jpeg;base64,${optimized.toString('base64')}`;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return base64Image;
    }
  }

  // Generate multiple sizes for responsive images
  static async generateResponsiveImages(base64Image) {
    try {
      const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const [thumbnail, medium, large] = await Promise.all([
        sharp(buffer).resize(300, 200, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer(),
        sharp(buffer).resize(600, 400, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer(),
        sharp(buffer).resize(1200, 800, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer()
      ]);
      
      return {
        thumbnail: `data:image/jpeg;base64,${thumbnail.toString('base64')}`,
        medium: `data:image/jpeg;base64,${medium.toString('base64')}`,
        large: `data:image/jpeg;base64,${large.toString('base64')}`
      };
    } catch (error) {
      console.error('Error generating responsive images:', error);
      return {
        thumbnail: base64Image,
        medium: base64Image,
        large: base64Image
      };
    }
  }
}

module.exports = ImageOptimizer; 