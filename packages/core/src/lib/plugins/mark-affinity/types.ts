import type { TText } from '@udecode/slate';
import type { NodeEntry } from 'slate';

export type MarkBoundary =
  | [NodeEntry<TText>, NodeEntry<TText>]
  | [NodeEntry<TText>, null]
  | [null, NodeEntry<TText>];
