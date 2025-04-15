import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { modelOptions } from '~/lib/image-generator-constants';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="model">Model</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
}
