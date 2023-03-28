import { ResizeLength, ResizeLengthStatic } from '../types';

export const resizeLengthToStatic = (
  length: ResizeLength,
  parentLength: number
): ResizeLengthStatic => {
  if (typeof length === 'string') {
    return (parentLength * parseFloat(length)) / 100;
  }

  return length;
};
