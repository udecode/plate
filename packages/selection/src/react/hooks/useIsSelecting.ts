import {
  type PlateEditor,
  useEditorSelector,
  usePluginOption,
} from '@udecode/plate/react';

import { isSelecting } from '../../lib';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const isSelectingOrFocused = (editor: PlateEditor) => {
  return isSelecting(editor) || editor.api.isFocused();
};

export const useIsSelecting = () => {
  const isSelectingSome = usePluginOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = useEditorSelector((editor) => {
    return editor.api.isExpanded();
  }, []);

  return selectionExpanded || isSelectingSome;
};
