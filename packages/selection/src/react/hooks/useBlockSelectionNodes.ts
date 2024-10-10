import { useMemo } from 'react';

import {
  type GetFragmentPropOptions,
  type TElement,
  getFragmentProp,
  getNodeEntries,
} from '@udecode/plate-common';
import { useEditorPlugin } from '@udecode/plate-common/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export function useBlockSelectionNodes() {
  const { editor, useOption } = useEditorPlugin(BlockSelectionPlugin);
  const selectedIds = useOption('selectedIds');

  return useMemo(() => {
    return [
      ...getNodeEntries<TElement>(editor, {
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
