import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';

interface PromptFieldsProps {
  prompt: string;
  negativePrompt: string;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
}

export function PromptFields({ 
  prompt, 
  negativePrompt, 
  onPromptChange, 
  onNegativePromptChange 
}: PromptFieldsProps) {
  return (
    <>
      {/* Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-24"
        />
      </div>

      {/* Negative Prompt */}
      <div className="space-y-2">
        <Label htmlFor="negative_prompt">Negative Prompt</Label>
        <Textarea
          id="negative_prompt"
          placeholder="Elements to avoid in the generated image..."
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          className="min-h-16"
        />
      </div>
    </>
  );
}
