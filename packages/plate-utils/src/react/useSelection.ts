import { useEditorSelector } from '@udecode/plate-core/react';
import {
  isRangeAcrossBlocks,
  isRangeInSameBlock,
  isSelectionExpanded,
} from '@udecode/slate-utils';

export function useSelectionCollapsed() {
  return useEditorSelector((editor) => !isSelectionExpanded(editor), []);
}

export function useSelectionExpanded() {
  return useEditorSelector((editor) => isSelectionExpanded(editor), []);
}

export function useSelectionWithinBlock() {
  return useEditorSelector((editor) => isRangeInSameBlock(editor), []);
}

export function useSelectionAcrossBlocks() {
  return useEditorSelector((editor) => isRangeAcrossBlocks(editor), []);
}
