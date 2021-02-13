import isHotkey from 'is-hotkey';
import { Editor, Transforms } from 'slate';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { someNode } from '../../common/queries/someNode';
import { ResetBlockTypePluginOptions } from './types';

export const onKeyDownResetBlockType = ({
  rules,
}: ResetBlockTypePluginOptions) => (
  event: KeyboardEvent | null,
  editor: Editor
) => {
  let reset: boolean | undefined;

  if (editor.selection && isCollapsed(editor.selection)) {
    rules.forEach(({ types, defaultType, hotkey, predicate, onReset }) => {
      if (!event || (hotkey && isHotkey(hotkey, event))) {
        if (predicate(editor) && someNode(editor, { match: { type: types } })) {
          event?.preventDefault();

          Transforms.setNodes(editor, { type: defaultType });

          onReset?.(editor);

          reset = true;
        }
      }
    });
  }

  return reset;
};
