import { NextRequest, NextResponse } from 'next/server';
import { generateImage, ImageGenerationParams } from '~/lib/together';
import { type } from 'arktype';

// 定义请求参数的ArkType类型
const ImageRequestSchema = type({
  model: 'string?',
  prompt: 'string',
  negative_prompt: 'string?',
  width: 'number?',
  height: 'number?',
  steps: 'number?',
  guidance: 'number?',
  seed: 'number?',
  n: 'number?',
  customApiKey: 'string?'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 使用ArkType验证请求参数
    const result = ImageRequestSchema(body);

    // 如果验证失败，返回错误
    if ('errors' in result) {
      const errors = result.errors as Array<{ message: string }>;
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          errorDetails: errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    // 提取验证后的数据
    const validatedData = result as { prompt: string; model?: string; [key: string]: any };

    // 检查必填字段
    if (!validatedData.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 创建参数对象
    const params: ImageGenerationParams = {
      model: validatedData.model || 'black-forest-labs/FLUX.1-schnell-Free', // 默认使用免费模型
      prompt: validatedData.prompt,
    };

    // 只添加有值的可选参数
    if (validatedData.negative_prompt) params.negative_prompt = validatedData.negative_prompt;
    if (validatedData.width) params.width = validatedData.width;
    if (validatedData.height) params.height = validatedData.height;
    if (validatedData.steps) params.steps = validatedData.steps;

    // 确保guidance参数的最小值不小于1
    if (validatedData.guidance !== undefined) {
      params.guidance = validatedData.guidance < 1 ? 1 : validatedData.guidance;
    }

    if (validatedData.seed) params.seed = validatedData.seed;
    if (validatedData.n) params.n = validatedData.n;
    if (validatedData.customApiKey) params.customApiKey = validatedData.customApiKey;

    console.log('API请求参数:', JSON.stringify(params, null, 2));

    // 调用生成图像函数
    const imageData = await generateImage(params);

    // 返回图像数据
    return NextResponse.json({ imageData });
  } catch (error: unknown) {
    console.error('生成图像时出错:', error);

    // 提取错误信息
    let errorMessage = 'Generate image error.';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;

      // 尝试提取更多错误详情
      if ('cause' in error && error.cause) {
        errorDetails = String(error.cause);
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
