import { useEditorSelector } from '@udecode/plate-core/react';

export function useSelectionCollapsed() {
  return useEditorSelector((editor) => !editor.api.isExpanded(), []);
}

export function useSelectionExpanded() {
  return useEditorSelector((editor) => editor.api.isExpanded(), []);
}

export function useSelectionWithinBlock() {
  return useEditorSelector((editor) => editor.api.isAt({ block: true }), []);
}

export function useSelectionAcrossBlocks() {
  return useEditorSelector((editor) => editor.api.isAt({ blocks: true }), []);
}
