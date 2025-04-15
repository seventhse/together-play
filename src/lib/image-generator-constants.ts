import { ImageGenerationParams } from '~/lib/together';

export interface ModelOption {
  value: string;
  label: string;
  defaultSteps?: number;
}

export const modelOptions: ModelOption[] = [
  // Free model
  { value: 'black-forest-labs/FLUX.1-schnell-Free', label: 'FLUX.1 Schnell (Free)', defaultSteps: 4 },

  // Flux models
  { value: 'black-forest-labs/FLUX.1-schnell', label: 'FLUX.1 Schnell (Turbo)', defaultSteps: 4 },
  { value: 'black-forest-labs/FLUX.1-dev', label: 'FLUX.1 Dev', defaultSteps: 28 },
  { value: 'black-forest-labs/FLUX.1-canny', label: 'FLUX.1 Canny', defaultSteps: 28 },
  { value: 'black-forest-labs/FLUX.1-depth', label: 'FLUX.1 Depth', defaultSteps: 28 },
  { value: 'black-forest-labs/FLUX.1-redux', label: 'FLUX.1 Redux', defaultSteps: 28 },
  { value: 'black-forest-labs/FLUX.1.1-pro', label: 'FLUX.1.1 Pro', defaultSteps: 28 },
  { value: 'black-forest-labs/FLUX.1-pro', label: 'FLUX.1 Pro', defaultSteps: 28 },
];

// Get the default model
export const defaultModel = modelOptions[0];

export const defaultParams: ImageGenerationParams = {
  model: defaultModel.value,
  width: 1024,
  height: 768,
  prompt: '',
  negative_prompt: '',
  guidance: 1,
  seed: Math.floor(Math.random() * 1000000),
  steps: defaultModel.defaultSteps || 4,
  n: 1
};

// Resolution options
export const resolutionOptions = [
  { value: '512', label: '512px' },
  { value: '768', label: '768px' },
  { value: '1024', label: '1024px' },
  { value: '1280', label: '1280px' },
];

// Number of images options
export const imageCountOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];
