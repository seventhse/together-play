'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { StoredImage, getAllImages, deleteImage, clearAllImages } from '~/lib/db';

export function ImageHistory() {
  const [historyImages, setHistoryImages] = useState<StoredImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load images from IndexedDB when component mounts
  useEffect(() => {
    loadImages();
  }, []);

  // Load all images from IndexedDB
  const loadImages = async () => {
    try {
      setIsLoading(true);
      const images = await getAllImages();
      setHistoryImages(images);
    } catch (error) {
      console.error('Failed to load image history:', error);
      toast.error('Failed to Load History', {
        description: 'There was a problem accessing your saved images. Please try again later.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a single image
  const handleDeleteImage = async (id: number) => {
    try {
      await deleteImage(id);
      setHistoryImages(prevImages => prevImages.filter(img => img.id !== id));
      toast.success('Image deleted');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Delete Failed', {
        description: 'Could not delete the selected image. Please try again.',
        duration: 5000
      });
    }
  };

  // Clear all images
  const handleClearHistory = async () => {
    try {
      await clearAllImages();
      setHistoryImages([]);
      toast.success('Image history cleared');
    } catch (error) {
      console.error('Failed to clear image history:', error);
      toast.error('Clear History Failed', {
        description: 'Could not clear your image history. Please try again later.',
        duration: 5000
      });
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="min-h-[300px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Image History</CardTitle>
        {historyImages.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                Clear History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear Image History</DialogTitle>
                <DialogDescription>
                  Are you sure you want to clear all image history? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  const closeButton = document.querySelector('[data-state="open"]')?.querySelector('button[data-state="closed"]') as HTMLButtonElement;
                  closeButton?.click();
                }}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  handleClearHistory();
                  const closeButton = document.querySelector('[data-state="open"]')?.querySelector('button[data-state="closed"]') as HTMLButtonElement;
                  closeButton?.click();
                }}>Clear All</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-4 pt-3 flex-1">
        {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading history...</p>
          </div>
        </div>
      ) : historyImages.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px] pr-2">
          {historyImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 p-2">
                  <img
                    src={`data:image/png;base64,${image.imageData}`}
                    alt={`Generated image: ${image.prompt}`}
                    className="w-full h-auto rounded-md"
                  />
                </div>
                <div className="md:w-2/3 p-3 flex flex-col">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {formatDate(image.timestamp)}
                    </p>
                    <p className="font-medium mb-2 line-clamp-2">{image.prompt}</p>
                    <div className="mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {image.model.split('/').pop()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-block mr-2">
                        {String(image.params.width)}×{String(image.params.height)}
                      </span>
                      {image.params.steps !== undefined && (
                        <span className="inline-block mr-2">
                          Steps: {String(image.params.steps)}
                        </span>
                      )}
                      {image.params.guidance !== undefined && (
                        <span className="inline-block">
                          Guidance: {String(image.params.guidance)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/png;base64,${image.imageData}`;
                        link.download = `generated-image-${image.timestamp}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Image</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this image?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            const closeButton = document.querySelector('[data-state="open"]')?.querySelector('button[data-state="closed"]') as HTMLButtonElement;
                            closeButton?.click();
                          }}>Cancel</Button>
                          <Button variant="destructive" onClick={() => {
                            if (image.id) handleDeleteImage(image.id);
                            const closeButton = document.querySelector('[data-state="open"]')?.querySelector('button[data-state="closed"]') as HTMLButtonElement;
                            closeButton?.click();
                          }}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>No image history</p>
            <p className="text-sm">Generated images will appear here</p>
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  );
}
