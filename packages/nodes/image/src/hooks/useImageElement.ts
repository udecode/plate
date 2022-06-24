import { useElement } from '@udecode/plate-core';
import { ELEMENT_IMAGE } from '../createImagePlugin';
import { TImageElement } from '../types';

export const useImageElement = () => useElement<TImageElement>(ELEMENT_IMAGE);
