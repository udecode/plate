import {
  type PlateEditor,
  useEditorSelector,
  usePluginOption,
} from '@platejs/core/react';

import { isSelecting } from '../../lib';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const isSelectingOrFocused = (editor: PlateEditor) =>
  isSelecting(editor) || editor.read.view.isFocused();

export const useIsSelecting = () => {
  const isSelectingSome = usePluginOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = useEditorSelector((editor) =>
    editor.read.selection.isExpanded()
  );

  return selectionExpanded || isSelectingSome;
};
