import { Slider } from '~/components/ui/slider';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { modelOptions, imageCountOptions } from '~/lib/image-generator-constants';
import { ImageGenerationParams } from '~/lib/together';

interface AdvancedOptionsProps {
  params: ImageGenerationParams;
  customApiKey: string;
  onParamChange: <K extends keyof ImageGenerationParams>(key: K, value: ImageGenerationParams[K]) => void;
  onCustomApiKeyChange: (value: string) => void;
  onRandomSeed: () => void;
  onReset: () => void;
}

export function AdvancedOptions({
  params,
  customApiKey,
  onParamChange,
  onCustomApiKeyChange,
  onRandomSeed,
  onReset
}: AdvancedOptionsProps) {
  const selectedModel = modelOptions.find(model => model.value === params.model);

  return (
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
          {selectedModel?.defaultSteps && (
            <span className="text-xs text-muted-foreground">
              Default: {selectedModel.defaultSteps}
            </span>
          )}
        </div>
        <Slider
          id="steps"
          min={1}
          max={50}
          step={1}
          value={[params.steps || 4]}
          onValueChange={(value) => onParamChange('steps', value[0])}
        />
      </div>

      {/* Guidance Scale */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="guidance">Guidance Scale: {params.guidance}</Label>
        </div>
        <Slider
          id="guidance"
          min={1} /* 将最小值设置为1 */
          max={20}
          step={0.1}
          value={[params.guidance || 1]}
          onValueChange={(value) => onParamChange('guidance', value[0])}
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
            onClick={onRandomSeed}
          >
            Randomize
          </Button>
        </div>
        <Input
          id="seed"
          type="number"
          value={params.seed}
          onChange={(e) => onParamChange('seed', parseInt(e.target.value) || 0)}
        />
      </div>

      {/* Number of Images */}
      <div className="space-y-2">
        <Label htmlFor="n">Number of Images</Label>
        <Select
          value={params.n?.toString()}
          onValueChange={(value) => onParamChange('n', parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select number" />
          </SelectTrigger>
          <SelectContent>
            {imageCountOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom API Key */}
      <div className="space-y-2">
        <Label htmlFor="customApiKey">Custom API Key (Optional)</Label>
        <Input
          id="customApiKey"
          type="password"
          placeholder="Your Together.ai API key"
          value={customApiKey}
          onChange={(e) => onCustomApiKeyChange(e.target.value)}
        />
      </div>

      {/* Reset Button */}
      <Button
        type="button"
        variant="destructive"
        className="w-full"
        onClick={onReset}
      >
        Reset All Parameters
      </Button>
    </div>
  );
}
