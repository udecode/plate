import type { TElement, TText } from '@platejs/slate';
import type { NodeEntry } from 'slate';

export type EdgeNodes =
  | [NodeEntry<TElement | TText>, NodeEntry<TElement | TText>]
  | [NodeEntry<TElement | TText>, null]
  | [null, NodeEntry<TElement | TText>];
