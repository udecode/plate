import type { TElement, TText } from '@udecode/slate';
import type { NodeEntry } from 'slate';

export type Boundary =
  | [NodeEntry<TElement | TText>, NodeEntry<TElement | TText>]
  | [NodeEntry<TElement | TText>, null]
  | [null, NodeEntry<TElement | TText>];
