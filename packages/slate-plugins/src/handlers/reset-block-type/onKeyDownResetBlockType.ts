import isHotkey from 'is-hotkey';
import { Editor, Transforms } from 'slate';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { isNodeTypeIn } from '../../common/queries/isNodeTypeIn';
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
        if (predicate(editor) && isNodeTypeIn(editor, types)) {
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
