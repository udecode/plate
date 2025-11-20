import {
  type PlateEditor,
  useEditorSelector,
  usePluginOption,
} from 'platejs/react';

import { isSelecting } from '../../lib';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const isSelectingOrFocused = (editor: PlateEditor) =>
  isSelecting(editor) || editor.api.isFocused();

export const useIsSelecting = () => {
  const isSelectingSome = usePluginOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = useEditorSelector(
    (editor) => editor.api.isExpanded(),
    []
  );

  return selectionExpanded || isSelectingSome;
};
