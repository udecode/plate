import { Text } from 'slate';

import { TText } from './TText';

/**
 * Check if an text matches set of properties.
 *
 * Note: this is for matching custom properties, and it does not ensure that
 * the `text` property are two nodes equal.
 */
export const textMatches = <T extends TText>(text: T, props: object) =>
  Text.matches(text, props);
