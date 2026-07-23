import { useMemo } from 'react';

import { getFragmentProp, type GetFragmentPropOptions } from '@platejs/core';
import { type Element, ElementApi } from '@platejs/plite';

import { useEditor, usePluginOption } from '@platejs/core/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export function useBlockSelectionNodes() {
  const editor = useEditor();
  const selectedIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');

  return useMemo(
    () =>
      editor.read.nodes.toArray<Element>({
        at: [],
        match: (node) =>
          ElementApi.isElement(node) &&
          !!node.id &&
          !!selectedIds?.has(node.id as string),
      }),
    [editor, selectedIds]
  );
}

export function useBlockSelectionFragment() {
  const nodes = useBlockSelectionNodes();

  return useMemo(() => nodes.map(([node]) => node), [nodes]);
}

export function useBlockSelectionFragmentProp(
  options?: GetFragmentPropOptions
) {
  const fragment = useBlockSelectionFragment();

  return useMemo(() => getFragmentProp(fragment, options), [fragment, options]);
}
