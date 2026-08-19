import { useEditor, usePluginStore } from '@platejs/core/react';
import { useElementContext } from '@platejs/core/react/internal';
import type { NodeKey } from '@platejs/plite';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';

export const useBlockSelected = (key?: NodeKey) => {
  const editor = useEditor();
  const element = useElementContext()?.element;
  const nodeKey = key ?? (element ? editor.key(element) : undefined);

  return usePluginStore(BlockSelectionPlugin, 'isSelected', nodeKey);
};
