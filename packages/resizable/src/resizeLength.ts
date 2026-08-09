export type ResizeDirection = 'bottom' | 'left' | 'right' | 'top';

export type ResizeEvent = {
  delta: ResizeLengthStatic;
  direction: ResizeDirection;
  finished: boolean;
  initialSize: ResizeLengthStatic;
};

export type ResizeLength = ResizeLengthStatic | string;

export type ResizeLengthRelative = `${number}%`;

export type ResizeLengthStatic = number;

export type ResizeLengthClampOptions<T = ResizeLength> = {
  max?: T;
  min?: T;
};

export const resizeLengthToRelative = (
  length: ResizeLength,
  parentLength: number
): ResizeLengthRelative =>
  typeof length === 'string' && length.trim().endsWith('%')
    ? (length as ResizeLengthRelative)
    : `${(resizeLengthToStatic(length, parentLength) / parentLength) * 100}%`;

export const resizeLengthToStatic = (
  length: ResizeLength,
  parentLength: number
): ResizeLengthStatic =>
  typeof length === 'string'
    ? length.trim().endsWith('%')
      ? (parentLength * Number.parseFloat(length)) / 100
      : Number.parseFloat(length)
    : length;

export const resizeLengthClampStatic = (
  length: ResizeLengthStatic,
  { max, min }: ResizeLengthClampOptions<ResizeLengthStatic>
): ResizeLengthStatic => {
  let result = length;

  if (min !== undefined) result = Math.max(result, min);
  if (max !== undefined) result = Math.min(result, max);

  return result;
};

export function resizeLengthClamp(
  length: ResizeLengthStatic,
  parentLength: number,
  { max, min }: ResizeLengthClampOptions
): ResizeLengthStatic;
export function resizeLengthClamp(
  length: string,
  parentLength: number,
  { max, min }: ResizeLengthClampOptions
): string;
export function resizeLengthClamp(
  length: ResizeLength,
  parentLength: number,
  { max, min }: ResizeLengthClampOptions
): ResizeLength {
  const clampedLength = resizeLengthClampStatic(
    resizeLengthToStatic(length, parentLength),
    {
      max:
        max === undefined ? undefined : resizeLengthToStatic(max, parentLength),
      min:
        min === undefined ? undefined : resizeLengthToStatic(min, parentLength),
    }
  );

  if (typeof length === 'number') return clampedLength;

  return length.trim().endsWith('%')
    ? resizeLengthToRelative(clampedLength, parentLength)
    : `${clampedLength}px`;
}
