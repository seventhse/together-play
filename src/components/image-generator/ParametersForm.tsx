import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { ImageGenerationParams } from '~/lib/together';
import { ModelSelector } from './ModelSelector';
import { PromptFields } from './PromptFields';
import { ResolutionControls } from './ResolutionControls';
import { AdvancedOptions } from './AdvancedOptions';


interface ParametersFormProps {
  params: ImageGenerationParams;
  customApiKey: string;
  isLoading: boolean;
  onParamChange: <K extends keyof ImageGenerationParams>(key: K, value: ImageGenerationParams[K]) => void;
  onCustomApiKeyChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export function ParametersForm({
  params,
  customApiKey,
  isLoading,
  onParamChange,
  onCustomApiKeyChange,
  onSubmit,
  onReset
}: ParametersFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generate a new random seed
  const generateRandomSeed = () => {
    onParamChange('seed', Math.floor(Math.random() * 1000000));
  };

  return (
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
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Model Selection */}
          <ModelSelector
            value={params.model}
            onChange={(value) => onParamChange('model', value)}
          />

          {/* Prompt Fields */}
          <PromptFields
            prompt={params.prompt}
            negativePrompt={params.negative_prompt || ''}
            onPromptChange={(value) => onParamChange('prompt', value)}
            onNegativePromptChange={(value) => onParamChange('negative_prompt', value)}
          />

          {/* Resolution Controls */}
          <ResolutionControls
            width={params.width || 1024}
            height={params.height || 768}
            onWidthChange={(value) => onParamChange('width', value)}
            onHeightChange={(value) => onParamChange('height', value)}
          />

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
            <AdvancedOptions
              params={params}
              customApiKey={customApiKey}
              onParamChange={onParamChange}
              onCustomApiKeyChange={onCustomApiKeyChange}
              onRandomSeed={generateRandomSeed}
              onReset={onReset}
            />
          )}

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={isLoading || !params.prompt}
            className="w-full py-2"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
