import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { ImageGenerationParams } from '~/lib/together';

interface GeneratedImagesProps {
  isLoading: boolean;
  images: string[];
  params: ImageGenerationParams;
}

export function GeneratedImages({ isLoading, images, params }: GeneratedImagesProps) {
  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `generated-image-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((imageData, index) => (
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
                    onClick={() => handleDownload(imageData, index)}
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
  );
}
