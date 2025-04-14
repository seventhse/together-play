import { NextRequest, NextResponse } from 'next/server';
import { generateImage, ImageGenerationParams } from '~/lib/together';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Extract parameters from the request body
    const params: ImageGenerationParams = {
      model: body.model,
      prompt: body.prompt,
      negative_prompt: body.negative_prompt,
      width: body.width,
      height: body.height,
      steps: body.steps,
      guidance: body.guidance,
      seed: body.seed,
      n: body.n,
      image_url: body.image_url,
      image_loras: body.image_loras,
      customApiKey: body.customApiKey,
    };

    // Generate the image
    const imageData = await generateImage(params);

    // Return the image data
    return NextResponse.json({ imageData });
  } catch (error: any) {
    console.error('Error in image generation API:', error);

    // Extract more detailed error information
    let errorMessage = 'Failed to generate image';
    let errorDetails = '';

    if (error?.message) {
      errorMessage = error.message;

      // Check for specific Together.ai API errors
      if (error.message.includes('API key')) {
        errorDetails = 'Please check your API key and try again.';
      } else if (error.message.includes('rate limit')) {
        errorDetails = 'You have exceeded the rate limit. Please try again later.';
      } else if (error.message.includes('model')) {
        errorDetails = 'The selected model may not be available. Try a different model.';
      } else if (error.response?.data?.error) {
        // Extract error details from Together.ai API response if available
        errorDetails = error.response.data.error;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        errorDetails: errorDetails || undefined
      },
      { status: 500 }
    );
  }
}
