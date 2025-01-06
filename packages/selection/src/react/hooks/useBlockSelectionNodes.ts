import { useMemo } from 'react';

import {
  type GetFragmentPropOptions,
  type TElement,
  getFragmentProp,
} from '@udecode/plate';
import { useEditorPlugin } from '@udecode/plate/react';

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
  options?: GetFragmentPropOptions
) {
  const fragment = useBlockSelectionFragment();

  return useMemo(() => getFragmentProp(fragment, options), [fragment, options]);
}
