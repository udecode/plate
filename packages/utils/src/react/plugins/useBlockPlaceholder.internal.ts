import { ElementStatePlugin, type WithAnyKey } from '@platejs/core';
import {
  type PlatePluginContext,
  useEditorComposing,
  useEditorFocused,
  useEditorReadOnly,
  useEditorSelector,
} from '@platejs/core/react';
import { PathApi } from '@platejs/plite';
import { useEffect } from 'react';

import type { BlockPlaceholderConfig } from './BlockPlaceholderPlugin';

export const useBlockPlaceholder = (
  ctx: PlatePluginContext<WithAnyKey<BlockPlaceholderConfig>>
) => {
  const { editor, store } = ctx;
  const focused = useEditorFocused();
  const readOnly = useEditorReadOnly();
  const composing = useEditorComposing();

  const entry = useEditorSelector(() => {
    if (
      readOnly ||
      composing ||
      !focused ||
      !editor.read.selection() ||
      editor.read.selection.isExpanded()
    ) {
      return null;
    }

    return editor.read.nodes.block();
  });

  useEffect(() => {
    if (!entry) {
      store.set({ _target: null });
      return;
    }

    const [node, path] = entry;
    const currentEntry = editor.read.nodes.block();

    if (!currentEntry || !PathApi.equals(path, currentEntry[1])) {
      store.set({ _target: null });
      return;
    }

    const { placeholders, query } = store.get();
    const children = editor.read.children();
    const firstNode = children[0];

    if (!firstNode) {
      store.set({ _target: null });
      return;
    }

    const isPristineEmptyEditor =
      children.length === 1 &&
      editor.read.nodes.isEmpty(firstNode) &&
      editor.plugin(ElementStatePlugin).api.isEmpty(firstNode);
    const placeholder = Object.keys(placeholders).find(
      (key) => editor.getType(key) === node.type
    );

    if (
      query({ ...ctx, node, path }) &&
      placeholder &&
      editor.read.nodes.isEmpty(node) &&
      !isPristineEmptyEditor
    ) {
      store.set({
        _target: {
          path,
          placeholder: placeholders[placeholder],
        },
      });
    } else {
      store.set({ _target: null });
    }
    // Keep this effect keyed to the editor state snapshot above; `ctx`
    // carries stable plugin helpers but is not itself a useful dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, entry, store]);
};
