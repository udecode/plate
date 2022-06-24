import { useElement } from '@udecode/plate-core';
import { TImageElement } from '../types';

export const useImageElement = () => useElement<TImageElement>('img');
