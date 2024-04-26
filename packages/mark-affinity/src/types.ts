import { TText } from '@udecode/plate-common';
import { NodeEntry } from 'slate';

export interface MarkAffinityPlugin {
  validMarks?: string[];
}

export type MarkBoundary =
  | [NodeEntry<TText>, NodeEntry<TText>]
  | [NodeEntry<TText>, null]
  | [null, NodeEntry<TText>];
