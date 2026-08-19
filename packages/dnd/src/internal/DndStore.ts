import React from 'react';

import { useEditor } from '@platejs/core/react';

import { DndStorePlugin, type DndPluginState } from './DndStorePlugin';

export const useDndPluginStore = <K extends keyof DndPluginState>(key: K) => {
  const editor = useEditor();
  const store = editor.plugin(DndStorePlugin).store;

  return React.useSyncExternalStore(
    store.subscribe,
    () => store.get()[key],
    () => store.get()[key]
  );
};

export const useDndPlugin = () => {
  const editor = useEditor();
  const store = editor.plugin(DndStorePlugin).store;

  React.useEffect(() => {
    const handleDragLeave = (event: DragEvent) => {
      if (!(event.target instanceof Node)) return;

      const editorDOMNode = editor.api.dom.resolveDOMNode(editor);

      if (!editorDOMNode) return;

      const targetElement =
        event.target instanceof HTMLElement
          ? event.target
          : event.target.parentElement;
      const relatedTarget = event.relatedTarget;
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
        store.set({ dropTarget: undefined });
      }
    };
    const handleDrop = () => {
      store.set({ _isOver: false });
      store.set({ dropTarget: undefined });
    };

    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, [editor, store]);
};
