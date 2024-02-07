import { TDescendant } from '@udecode/plate-common';

import { StringCharMapping } from '../string-char-mapping';
import { letterToNode } from './letter-to-node';

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
