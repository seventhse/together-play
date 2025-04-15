'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { ImageGenerationParams } from '~/lib/together';
import { ImageHistory } from './ImageHistory';
import { defaultParams } from '~/lib/image-generator-constants';
import { handleImageGenerationError } from '~/lib/error-utils';
import { generateImages, saveGeneratedImages } from '~/lib/image-service';
import { ParametersForm } from './image-generator/ParametersForm';
import { GeneratedImages } from './image-generator/GeneratedImages';
import { modelOptions } from '~/lib/image-generator-constants';

export function ImageGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [params, setParams] = useState<ImageGenerationParams>({ ...defaultParams })
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

      // 确保guidance值不小于1
      if (key === 'guidance' && typeof value === 'number' && value < 1) {
        newParams.guidance = 1;
      }

      return newParams;
    });
  };

  // Reset all parameters to default
  const resetParams = () => {
    setParams({ ...defaultParams, seed: Math.floor(Math.random() * 1000000) });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate images
      const imageDataArray = await generateImages(params, customApiKey);
      setGeneratedImages(imageDataArray);
      toast.success('Images generated successfully!');

      // Save images to history
      try {
        await saveGeneratedImages(imageDataArray, params);
      } catch (dbError) {
        console.error('Failed to save image to history:', dbError);
        // Don't show error to user as the image generation was successful
      }
    } catch (err: unknown) {
      handleImageGenerationError(err);
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
          <ParametersForm
            params={params}
            customApiKey={customApiKey}
            isLoading={isLoading}
            onParamChange={updateParam}
            onCustomApiKeyChange={setCustomApiKey}
            onSubmit={handleSubmit}
            onReset={resetParams}
          />
        </div>

        {/* Right side - Generated Images and History */}
        <div className="w-full lg:w-2/3 space-y-4">
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-4">
              <GeneratedImages
                isLoading={isLoading}
                images={generatedImages}
                params={params}
              />
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
