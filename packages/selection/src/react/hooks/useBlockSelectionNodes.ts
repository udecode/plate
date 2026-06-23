import { useMemo } from 'react';

import type { Element } from '@platejs/slate';

import { KEYS } from 'platejs';
import { type PlateEditor, useEditorRef, usePluginOption } from 'platejs/react';

const blockSelectionPlugin = { key: KEYS.blockSelection };

export type BlockSelectionFragmentPropOptions = Omit<
  NonNullable<Parameters<PlateEditor['api']['prop']>[0]>,
  'nodes'
>;

export function useBlockSelectionNodes() {
  const editor = useEditorRef();
  const selectedIds = usePluginOption(blockSelectionPlugin, 'selectedIds');

  return useMemo(
    () =>
      editor.api.blocks<Element>({
        at: [],
        match: (n) => !!n.id && selectedIds?.has(n.id as string),
      }),
    [editor, selectedIds]
  );
}

export function useBlockSelectionFragment() {
  const nodes = useBlockSelectionNodes();

  return useMemo(() => nodes.map(([node]) => node), [nodes]);
}

export function useBlockSelectionFragmentProp(
  options?: BlockSelectionFragmentPropOptions
) {
  const editor = useEditorRef();
  const fragment = useBlockSelectionFragment();

  return useMemo(
    () => editor.api.prop({ nodes: fragment, ...options }),
    [editor.api, fragment, options]
  );
}
