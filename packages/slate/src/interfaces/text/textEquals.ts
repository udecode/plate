import { Text } from 'slate';

import type { TText } from './TText';

/** Check if two text nodes are equal. */
export const textEquals = (text: TText, another: TText) =>
  Text.equals(text, another);
