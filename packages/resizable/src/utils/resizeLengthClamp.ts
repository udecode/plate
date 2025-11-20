import type { ResizeLength, ResizeLengthStatic } from '../types';

import { resizeLengthToRelative } from './resizeLengthToRelative';
import { resizeLengthToStatic } from './resizeLengthToStatic';

export type ResizeLengthClampOptions<T = ResizeLength> = {
  max?: T;
  min?: T;
};

export const resizeLengthClampStatic = (
  length: ResizeLengthStatic,
  { max, min }: ResizeLengthClampOptions<ResizeLengthStatic>
): ResizeLengthStatic => {
  let result = length;

  if (min !== undefined) {
    result = Math.max(result, min);
  }
  if (max !== undefined) {
    result = Math.min(result, max);
  }

  return result;
};

export const resizeLengthClamp = <T extends ResizeLength>(
  length: T,
  parentLength: number,
  { max, min }: ResizeLengthClampOptions<ResizeLength>
): T => {
  const staticLength = resizeLengthToStatic(length, parentLength);

  const clampedStaticLength = resizeLengthClampStatic(staticLength, {
    max:
      max === undefined ? undefined : resizeLengthToStatic(max, parentLength),
    min:
      min === undefined ? undefined : resizeLengthToStatic(min, parentLength),
  });

  switch (typeof length) {
    case 'number': {
      return clampedStaticLength as T;
    }
    case 'string': {
      return resizeLengthToRelative(clampedStaticLength, parentLength) as T;
    }

    default: {
      throw new Error('Invalid length type');
    }
  }
};
