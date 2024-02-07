import { TDescendant } from '@udecode/plate-common';

import { StringCharMapping } from '../string-char-mapping';

export function letterToNode(x: string, stringMapping: StringCharMapping) {
  const node: TDescendant = JSON.parse(stringMapping._to_string[x]);
  if (node == null) {
    throw new Error('letterToNode: bug');
  }
  return node;
}
