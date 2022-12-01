import { useCommentsActions } from '@udecode/plate-comments';
import {
  createPluginFactory,
  isExpanded,
  PlateEditor,
  useHotkeys,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { useAddCommentMark } from './stores/index';
import { MARK_COMMENT } from './constants';
import { CommentsPlugin } from './types';
import { withComments } from './withComments';

export const useHooksComments = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options }: WithPlatePlugin<CommentsPlugin>
) => {
  const { hotkey } = options;

  const addCommentMark = useAddCommentMark();
  const setFocusTextarea = useCommentsActions().focusTextarea();

  useHotkeys(
    hotkey!,
    (e) => {
      if (!editor.selection) return;

      e.preventDefault();

      // block comments

      if (!isExpanded(editor.selection)) return;

      addCommentMark();
      setFocusTextarea(true);
    },
    {
      enableOnContentEditable: true,
    }
  );
};

export const createCommentsPlugin = createPluginFactory<CommentsPlugin>({
  key: MARK_COMMENT,
  isLeaf: true,
  withOverrides: withComments,
  useHooks: useHooksComments,
  options: {
    hotkey: 'command+shift+m',
  },
});
