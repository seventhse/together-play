import { toast } from 'sonner';

/**
 * 处理图像生成过程中的错误
 */
export function handleImageGenerationError(err: unknown): void {
  const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
  const errorDetails = err instanceof Error && err.cause ? String(err.cause) : '';

  // 根据错误类型确定适当的错误标题
  let errorTitle = 'Image Generation Failed';
  let duration = 8000; // 默认持续时间（毫秒）

  if (errorMessage.includes('API key')) {
    errorTitle = 'API Key Error';
  } else if (errorMessage.includes('rate limit')) {
    errorTitle = 'Rate Limit Exceeded';
  } else if (errorMessage.includes('model')) {
    errorTitle = 'Model Error';
  } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    errorTitle = 'Network Error';
  } else if (errorMessage.includes('Invalid response format')) {
    errorTitle = 'Response Format Error';
  }

  // 对于严重错误，保持toast提示更长时间可见
  if (errorMessage.includes('API key') || errorMessage.includes('Invalid response format')) {
    duration = Infinity;
  }

  // 显示错误toast提示
  toast.error(errorTitle, {
    description: errorDetails || errorMessage,
    duration: duration,
  });
}
