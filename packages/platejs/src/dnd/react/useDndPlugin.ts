import React from 'react';

import { useEditor } from '../../react/core';
import { DndStorePlugin } from './internal/DndStorePlugin';

/** Attach drag cleanup for one mounted view. A null element owns no DOM listeners. */
export const useDndPlugin = (editableElement: HTMLElement | null): void => {
  const editor = useEditor();
  const { store } = editor.plugin(DndStorePlugin);

  React.useEffect(() => {
    if (!editableElement) return undefined;

    const document = editableElement.ownerDocument;
    const Node = document.defaultView?.Node;
    const HTMLElement = document.defaultView?.HTMLElement;

    if (!Node || !HTMLElement) return undefined;

    const handleDragLeave = (event: DragEvent) => {
      if (!(event.target instanceof Node)) return;

      const editorDOMNode = editableElement;

      const targetElement =
        event.target instanceof HTMLElement
          ? event.target
          : event.target.parentElement;
      const { relatedTarget } = event;
      const relatedElement =
        relatedTarget instanceof HTMLElement
          ? relatedTarget
          : relatedTarget instanceof Node
            ? relatedTarget.parentElement
            : null;
      const targetBlock = targetElement?.closest('[data-plite-node-key]');
      const relatedBlock = relatedElement?.closest('[data-plite-node-key]');
      const isLeavingEditor = !(
        event.target === editorDOMNode || editorDOMNode.contains(event.target)
      );
      const isLeavingBlockForEditorWhitespace =
        !!targetBlock &&
        !relatedBlock &&
        (!relatedTarget ||
          (relatedTarget instanceof Node &&
            editorDOMNode.contains(relatedTarget)));

      if (isLeavingEditor || isLeavingBlockForEditorWhitespace) {
        store.set({ dropTarget: null });
      }
    };
    const handleDrop = () => {
      store.set({ _isOver: false });
      store.set({ dropTarget: null });
    };

    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, [editableElement, store]);
};
