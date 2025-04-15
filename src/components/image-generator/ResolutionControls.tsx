import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { resolutionOptions } from '~/lib/image-generator-constants';

interface ResolutionControlsProps {
  width: number;
  height: number;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
}

export function ResolutionControls({ 
  width, 
  height, 
  onWidthChange, 
  onHeightChange 
}: ResolutionControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="width">Width</Label>
        <Select 
          value={width?.toString()} 
          onValueChange={(value) => onWidthChange(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select width" />
          </SelectTrigger>
          <SelectContent>
            {resolutionOptions.map(option => (
              <SelectItem key={`width-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="height">Height</Label>
        <Select 
          value={height?.toString()} 
          onValueChange={(value) => onHeightChange(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select height" />
          </SelectTrigger>
          <SelectContent>
            {resolutionOptions.map(option => (
              <SelectItem key={`height-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
