import { Text } from 'slate';
import { TText } from '../types/TText';

/**
 * Check if two text nodes are equal.
 */
export const textEquals = (text: TText, another: TText) =>
  Text.equals(text, another);
