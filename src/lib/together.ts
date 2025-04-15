import { Together } from 'together-ai';

// 定义图像生成参数接口
export interface ImageGenerationParams {
  model: string;
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  n?: number;
  customApiKey?: string;
}

// 创建Together实例
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY || '' });

/**
 * 生成图像
 */
export async function generateImage({ customApiKey, ...params }: ImageGenerationParams): Promise<Together.Images.ImageFile.Data[]> {
  try {
    // 使用自定义API密钥或默认密钥
    const instance = customApiKey ? new Together({ apiKey: customApiKey }) : together;

    // 创建请求参数对象
    const requestParams: Record<string, unknown> = {
      response_format: 'base64',
      model: params.model,
      prompt: params.prompt,
    };

    // 只添加有值的参数
    if (params.negative_prompt) requestParams.negative_prompt = params.negative_prompt;
    if (params.width) requestParams.width = params.width;
    if (params.height) requestParams.height = params.height;
    if (params.steps) requestParams.steps = params.steps;
    // 确保guidance参数的最小值不小于1
    if (params.guidance !== undefined) {
      // 如果值小于1，则使用默认值1
      requestParams.guidance = params.guidance < 1 ? 1 : params.guidance;
    }
    if (params.seed) requestParams.seed = params.seed;
    if (params.n) requestParams.n = params.n;

    // 调用API生成图像
    const response = await instance.images.create(requestParams as unknown as Together.ImageCreateParams);

    // 返回图像数据
    return response.data;
  } catch (error: unknown) {
    console.error('Error generating image:', error);

    // 提取错误信息
    let errorMessage = 'Failed to generate image';
    let errorDetails = '';

    // 处理Together.ai API错误
    if (error instanceof Error) {
      errorMessage = error.message;

      // 检查API响应错误
      const apiError = error as { response?: { data?: { error?: string } } };
      if (apiError.response?.data?.error) {
        // 提取Together.ai API响应中的错误详情
        errorDetails = apiError.response.data.error;
        errorMessage = 'API Error: ' + errorDetails;
      } else {
        // 检查特定错误类型
        if (error.message.includes('API key')) {
          errorDetails = 'Please check your API key and try again.';
        } else if (error.message.includes('rate limit')) {
          errorDetails = 'You have exceeded the rate limit. Please try again later.';
        } else if (error.message.includes('model')) {
          errorDetails = 'The selected model may not be available. Try a different model.';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorDetails = 'Network error. Please check your connection and try again.';
        }
      }
    }

    // 抛出错误并包含详细信息
    throw new Error(errorMessage, { cause: errorDetails });
  }
}