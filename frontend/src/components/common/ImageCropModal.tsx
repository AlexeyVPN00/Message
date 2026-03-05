import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
} from '@mui/material';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop';

interface ImageCropModalProps {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
}

export const ImageCropModal = ({
  open,
  imageUrl,
  onClose,
  onCropComplete,
  aspectRatio = 1,
}: ImageCropModalProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImageBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(croppedImageBlob);
    } catch (error) {
      console.error('Error creating cropped image:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Кадрирование изображения</DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: 400, backgroundColor: '#333' }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Масштаб
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => onZoomChange(value as number)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={createCroppedImage} variant="contained">
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Функция для создания кадрированного изображения
const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Устанавливаем размер canvas равным размеру кадрированной области
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Рисуем кадрированное изображение
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Конвертируем canvas в blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

// Вспомогательная функция для загрузки изображения
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
