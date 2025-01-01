import { isSelectionExpanded } from '@udecode/plate-common';
import {
  type PlateEditor,
  useEditorPlugin,
  useEditorSelector,
} from '@udecode/plate-common/react';

import { isSelecting } from '../../lib';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const isSelectingOrFocused = (editor: PlateEditor) => {
  return isSelecting(editor) || editor.api.isFocused();
};

export const useIsSelecting = () => {
  const isSelectingSome =
    useEditorPlugin(BlockSelectionPlugin).useOption('isSelectingSome');
  const selectionExpanded = useEditorSelector((editor) => {
    return isSelectionExpanded(editor);
  }, []);

  return selectionExpanded || isSelectingSome;
};
