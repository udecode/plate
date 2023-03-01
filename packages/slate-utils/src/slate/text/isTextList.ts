import { Text } from 'slate';
import { TText } from './TText';

/**
 * Check if a value is a list of `Text` objects.
 */
export const isTextList = (value: any): value is TText[] =>
  Text.isTextList(value);
