import {
  type PlateEditor,
  useEditorSelector,
  usePluginStore,
} from '@platejs/core/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const isSelectingOrFocused = (editor: PlateEditor) =>
  editor.plugin(BlockSelectionPlugin).read.isSelecting() ||
  editor.read.view.isFocused();

export const useIsSelecting = () => {
  const isSelectingSome = usePluginStore(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = useEditorSelector((editor) =>
    editor.read.selection.isExpanded()
  );

  return selectionExpanded || isSelectingSome;
};
