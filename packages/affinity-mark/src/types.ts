import { TText } from '@udecode/plate-common';
import { NodeEntry } from 'slate';

export interface MarkAffinityPlugin {
  pressRightArrowAtBoundary?: (
    editor: any,
    currentEndLeafEntry?: NodeEntry<TText>,
    nextLeafEntry?: NodeEntry<TText>
  ) => void;
}

export type MarkBoundary =
  | [NodeEntry<TText>, NodeEntry<TText>]
  | [NodeEntry<TText>, null]
  | [null, NodeEntry<TText>];
