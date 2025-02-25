import { useMemo } from 'react';

import type { EditorPropOptions, TElement } from '@udecode/plate';

import { useEditorRef, usePluginOption } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export function useBlockSelectionNodes() {
  const editor = useEditorRef();
  const selectedIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');

  return useMemo(() => {
    return editor.api.blocks<TElement>({
      at: [],
      match: (n) => !!n.id && selectedIds?.has(n.id as string),
    });
  }, [editor, selectedIds]);
}

export function useBlockSelectionFragment() {
  const nodes = useBlockSelectionNodes();

  return useMemo(() => nodes.map(([node]) => node), [nodes]);
}

export function useBlockSelectionFragmentProp(
  options?: Omit<EditorPropOptions, 'nodes'>
) {
  const editor = useEditorRef();
  const fragment = useBlockSelectionFragment();

  return useMemo(
    () => editor.api.prop({ nodes: fragment, ...options }),
    [editor.api, fragment, options]
  );
}
