import { useEditorSelector } from '@platejs/core/react';

export function useSelectionCollapsed() {
  return useEditorSelector((editor) => editor.read.selection.isCollapsed());
}

export function useSelectionExpanded() {
  return useEditorSelector((editor) => editor.read.selection.isExpanded());
}

export function useSelectionWithinBlock() {
  return useEditorSelector((editor) => editor.read.selection.isWithinBlock());
}

export function useSelectionAcrossBlocks() {
  return useEditorSelector((editor) => editor.read.selection.isAcrossBlocks());
}
