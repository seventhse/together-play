'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { ImageGenerationParams } from '~/lib/together';
import { saveImage } from '~/lib/db';
import { ImageHistory } from './ImageHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface ModelOption {
  value: string;
  label: string;
  defaultSteps?: number;
}

const modelOptions: ModelOption[] = [
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
const defaultModel = modelOptions[0];

const defaultParams: ImageGenerationParams = {
  model: defaultModel.value,
  width: 1024,
  height: 768,
  prompt: '',
  negative_prompt: '',
  guidance: 1,
  image_url: '',
  image_loras: [],
  seed: Math.floor(Math.random() * 1000000),
  steps: defaultModel.defaultSteps || 4,
  n: 1
};

export function ImageGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [params, setParams] = useState<ImageGenerationParams>({ ...defaultParams })
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  // Update a specific parameter in the state
  const updateParam = <K extends keyof ImageGenerationParams>(key: K, value: ImageGenerationParams[K]) => {
    setParams(prev => {
      const newParams = {
        ...prev,
        [key]: value
      };

      // If the model is changed, update the steps to the default for that model
      if (key === 'model') {
        const selectedModel = modelOptions.find(model => model.value === value);
        if (selectedModel?.defaultSteps) {
          newParams.steps = selectedModel.defaultSteps;
        }
      }

      return newParams;
    });
  };

  // Generate a new random seed
  const generateRandomSeed = () => {
    updateParam('seed', Math.floor(Math.random() * 1000000));
  };

  // Reset all parameters to default
  const resetParams = () => {
    setParams({ ...defaultParams, seed: Math.floor(Math.random() * 1000000) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          customApiKey: customApiKey || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image', {
          cause: errorData.errorDetails
        });
      }

      const data = await response.json();
      if (data.imageData && Array.isArray(data.imageData)) {
        const imageDataArray = data.imageData.map((img: any) => img.b64_json);
        setGeneratedImages(imageDataArray);
        toast.success('Images generated successfully!');

        // Save each generated image to IndexedDB
        try {
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
        } catch (dbError) {
          console.error('Failed to save image to history:', dbError);
          // Don't show error to user as the image generation was successful
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      const errorDetails = err instanceof Error && err.cause ? String(err.cause) : '';

      // Show error toast with details
      toast.error('Image Generation Failed', {
        description: errorDetails || errorMessage,
        duration: Infinity,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Together.ai Image Playground</h1>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left side - Parameters */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Image Parameters</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Pricing info</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="font-medium">Together.ai Pricing</p>
                      <p className="text-sm mt-1">Pricing is based on image size (megapixels) and steps. Using more steps than the default increases cost proportionally.</p>
                      <p className="text-sm mt-1">Free model (FLUX.1 Schnell Free) has a limit of 10 images per minute.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={params.model} onValueChange={(value) => updateParam('model', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {option.value.includes('-pro') && (
                          <Badge variant="outline" className="ml-2 text-xs bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                            Tier 2+
                          </Badge>
                        )}
                        {option.value === 'black-forest-labs/FLUX.1-schnell-Free' && (
                          <Badge variant="outline" className="ml-2 text-xs bg-green-500/10 text-green-700 border-green-500/20">
                            Free
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate..."
                value={params.prompt}
                onChange={(e) => updateParam('prompt', e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <Label htmlFor="negative_prompt">Negative Prompt</Label>
              <Textarea
                id="negative_prompt"
                placeholder="Elements to avoid in the generated image..."
                value={params.negative_prompt}
                onChange={(e) => updateParam('negative_prompt', e.target.value)}
                className="min-h-16"
              />
            </div>

            {/* Basic Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Select value={params.width?.toString()} onValueChange={(value) => updateParam('width', parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select width" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="768">768px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                    <SelectItem value="1280">1280px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Select value={params.height?.toString()} onValueChange={(value) => updateParam('height', parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select height" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="768">768px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                    <SelectItem value="1280">1280px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggle Advanced Options */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </Button>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="space-y-4 mt-4">
                <Separator className="my-4" />
                {/* Steps */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="steps">Steps: {params.steps}</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 cursor-pointer text-muted-foreground">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 16v-4" />
                              <path d="M12 8h.01" />
                            </svg>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Higher steps = better quality but higher cost.</p>
                            <p className="text-sm mt-1">Exceeding the default steps increases cost proportionally.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {(() => {
                      const selectedModel = modelOptions.find(model => model.value === params.model);
                      return selectedModel?.defaultSteps ? (
                        <span className="text-xs text-muted-foreground">
                          Default: {selectedModel.defaultSteps}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <Slider
                    id="steps"
                    min={1}
                    max={50}
                    step={1}
                    value={[params.steps || 4]}
                    onValueChange={(value) => updateParam('steps', value[0])}
                  />
                </div>

                {/* Guidance Scale */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="guidance">Guidance Scale: {params.guidance}</Label>
                  </div>
                  <Slider
                    id="guidance"
                    min={0}
                    max={20}
                    step={0.1}
                    value={[params.guidance || 1]}
                    onValueChange={(value) => updateParam('guidance', value[0])}
                  />
                </div>

                {/* Seed */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="seed">Seed</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRandomSeed}
                    >
                      Randomize
                    </Button>
                  </div>
                  <Input
                    id="seed"
                    type="number"
                    value={params.seed}
                    onChange={(e) => updateParam('seed', parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Number of Images */}
                <div className="space-y-2">
                  <Label htmlFor="n">Number of Images</Label>
                  <Select value={params.n?.toString()} onValueChange={(value) => updateParam('n', parseInt(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Image URL (for img2img) */}
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL (for img2img)</Label>
                  <Input
                    id="image_url"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={params.image_url || ''}
                    onChange={(e) => updateParam('image_url', e.target.value)}
                  />
                </div>

                {/* Custom API Key */}
                <div className="space-y-2">
                  <Label htmlFor="customApiKey">Custom API Key (Optional)</Label>
                  <Input
                    id="customApiKey"
                    type="password"
                    placeholder="Your Together.ai API key"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                  />
                </div>

                {/* Reset Button */}
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={resetParams}
                >
                  Reset All Parameters
                </Button>
              </div>
            )}

            {/* Generate Button */}
            <Button
              type="submit"
              disabled={isLoading || !params.prompt}
              className="w-full py-2"
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </Button>

            {/* Error Message - We'll use toast instead of this block */}
          </form>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Generated Images and History */}
        <div className="w-full lg:w-2/3 space-y-4">
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-4">
              <Card className="min-h-[300px] flex flex-col">
                <CardHeader>
                  <CardTitle>Generated Images</CardTitle>
                </CardHeader>

                <Separator />

                <CardContent className="p-4 pt-3">

                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Generating your image...</p>
                    </div>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedImages.map((imageData, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={`data:image/png;base64,${imageData}`}
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/70">
                              {params.model.split('/').pop()}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-2 flex justify-between">
                          <Button
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `data:image/png;base64,${imageData}`;
                              link.download = `generated-image-${Date.now()}-${index}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p>No images generated yet</p>
                      <p className="text-sm">Fill in the prompt and click Generate</p>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ImageHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
