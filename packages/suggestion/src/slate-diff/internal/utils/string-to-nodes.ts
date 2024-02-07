import { TDescendant } from '@udecode/plate-common';

import { letterToNode } from './letter-to-node';
import { StringCharMapping } from './string-char-mapping';

export function stringToNodes(
  s: string,
  stringMapping: StringCharMapping
): TDescendant[] {
  const nodes: TDescendant[] = [];
  for (const x of s) {
    nodes.push(letterToNode(x, stringMapping));
  }
  return nodes;
}
