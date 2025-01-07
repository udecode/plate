import { useMemo } from 'react';

import type { EditorPropOptions, TElement } from '@udecode/plate';

import { useEditorPlugin, useEditorRef } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export function useBlockSelectionNodes() {
  const { editor, useOption } = useEditorPlugin(BlockSelectionPlugin);
  const selectedIds = useOption('selectedIds');

  return useMemo(() => {
    return [
      ...editor.api.nodes<TElement>({
        at: [],
        match: (n) => selectedIds?.has(n.id),
      }),
    ];
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
