import { ImageGenerationParams } from '~/lib/together';
import { saveImage } from '~/lib/db';

/**
 * 调用API生成图像
 */
export async function generateImages(params: ImageGenerationParams, customApiKey?: string): Promise<string[]> {
  // 创建请求体对象，只包含有值的字段
  const requestBody: Record<string, unknown> = {};

  // 必填字段
  requestBody.model = params.model;
  requestBody.prompt = params.prompt;

  // 可选字段，只有当字段有值时才添加
  if (params.negative_prompt) requestBody.negative_prompt = params.negative_prompt;
  if (params.width) requestBody.width = params.width;
  if (params.height) requestBody.height = params.height;
  if (params.steps) requestBody.steps = params.steps;
  if (params.guidance !== undefined) requestBody.guidance = params.guidance;
  if (params.seed) requestBody.seed = params.seed;
  if (params.n) requestBody.n = params.n;
  if (customApiKey) requestBody.customApiKey = customApiKey;

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate image', {
      cause: errorData.errorDetails
    });
  }

  const data = await response.json();

  // 检查响应格式
  if (!data.imageData) {
    throw new Error('Invalid response format: missing imageData');
  }

  // 处理不同的响应格式
  if (Array.isArray(data.imageData)) {
    // 处理数组格式的响应
    return data.imageData.map((img: { b64_json: string }) => img.b64_json);
  } else if (data.imageData.data && Array.isArray(data.imageData.data)) {
    // 处理嵌套格式的响应
    return data.imageData.data.map((img: { b64_json: string }) => img.b64_json);
  } else {
    console.error('Unexpected response format:', data);
    throw new Error('Invalid response format: unexpected structure');
  }
}

/**
 * 保存生成的图像到历史记录
 */
export async function saveGeneratedImages(
  imageDataArray: string[],
  params: ImageGenerationParams
): Promise<void> {
  for (const imageData of imageDataArray) {
    await saveImage({
      imageData,
      prompt: params.prompt,
      model: params.model,
      timestamp: Date.now(),
      params: {
        width: params.width,
        height: params.height,
        steps: params.steps,
        guidance: params.guidance,
        seed: params.seed,
        negative_prompt: params.negative_prompt
      }
    });
  }
}
