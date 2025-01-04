import { Text } from 'slate';

import type { TText } from './TText';

/** Check if a value implements the `Text` interface. */
export const isTextNode = (value: any): value is TText => Text.isText(value);
