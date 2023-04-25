import { ResizeLength, ResizeLengthRelative } from '../types';

export const resizeLengthToRelative = (
  length: ResizeLength,
  parentLength: number
): ResizeLengthRelative => {
  if (typeof length === 'number') {
    return `${(length / parentLength) * 100}%`;
  }

  return length;
};
