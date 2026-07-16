import type { Editor } from '../interfaces/editor';
import type { Operation } from '../interfaces/operation';

export const shouldNormalize = (
  _editor: Editor,
  _options: {
    iteration: number;
    operation?: Operation;
  }
): boolean => true;
