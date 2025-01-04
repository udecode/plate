import { Text } from 'slate';

import type { TText } from './TText';

export const isTextNode = (value: any): value is TText => Text.isText(value);
