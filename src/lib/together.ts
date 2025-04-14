import { Together } from 'together-ai';

// Initialize the Together.ai client
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

export interface ImageGenerationParams extends Omit<Together.ImageCreateParams, 'response_format'> {
  customApiKey?: string
}

export async function generateImage({ customApiKey, ...params }: ImageGenerationParams): Promise<Together.Images.ImageFile.Data[]> {
  try {
    let instance = customApiKey ? new Together({ apiKey: customApiKey }) : together;

    const response = await instance.images.create({
      response_format: 'base64',
      width: 1024,
      ...params,
    });

    // Return the base64 image data
    return response.data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image');
  }
}
