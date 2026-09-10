import type { ResizeLength } from './Resizable';

export const resizeLengthToRelative = (
  length: number,
  parentLength: number
): `${number}%` => `${(length / parentLength) * 100}%`;

export const resizeLengthToStatic = (
  length: ResizeLength,
  parentLength: number
): number =>
  typeof length === 'string'
    ? length.trim().endsWith('%')
      ? (parentLength * Number.parseFloat(length)) / 100
      : Number.parseFloat(length)
    : length;

export const resizeLengthClamp = (
  length: number,
  parentLength: number,
  { max, min }: { max?: ResizeLength; min?: ResizeLength }
): number => {
  let result = length;
  if (min !== undefined) {
    result = Math.max(result, resizeLengthToStatic(min, parentLength));
  }
  if (max !== undefined) {
    result = Math.min(result, resizeLengthToStatic(max, parentLength));
  }
  return result;
};
