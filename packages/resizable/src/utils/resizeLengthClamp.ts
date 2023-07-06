import { ResizeLength, ResizeLengthStatic } from '../types';
import { resizeLengthToRelative } from './resizeLengthToRelative';
import { resizeLengthToStatic } from './resizeLengthToStatic';

export interface ResizeLengthClampOptions<T = ResizeLength> {
  min?: T;
  max?: T;
}

export const resizeLengthClampStatic = (
  length: ResizeLengthStatic,
  { min, max }: ResizeLengthClampOptions<ResizeLengthStatic>
): ResizeLengthStatic => {
  if (min !== undefined) {
    length = Math.max(length, min);
  }

  if (max !== undefined) {
    length = Math.min(length, max);
  }

  return length;
};

export const resizeLengthClamp = <T extends ResizeLength>(
  length: T,
  parentLength: number,
  { min, max }: ResizeLengthClampOptions<ResizeLength>
): T => {
  const staticLength = resizeLengthToStatic(length, parentLength);

  const clampedStaticLength = resizeLengthClampStatic(staticLength, {
    min:
      min === undefined ? undefined : resizeLengthToStatic(min, parentLength),
    max:
      max === undefined ? undefined : resizeLengthToStatic(max, parentLength),
  });

  switch (typeof length) {
    case 'string': {
      return resizeLengthToRelative(clampedStaticLength, parentLength) as T;
    }

    case 'number': {
      return clampedStaticLength as T;
    }

    default: {
      throw new Error('Invalid length type');
    }
  }
};
