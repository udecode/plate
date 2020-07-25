import isHotkey from 'is-hotkey';
import { Editor, Transforms } from 'slate';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { isNodeTypeIn } from '../../common/queries/isNodeTypeIn';
import { ResetBlockTypePluginOptions } from './types';

export const onKeyDownResetBlockType = ({
  rules,
}: ResetBlockTypePluginOptions) => (event: KeyboardEvent, editor: Editor) => {
  if (editor.selection && isCollapsed(editor.selection)) {
    rules.forEach(({ types, defaultType, hotkey, predicate, onReset }) => {
      if (isHotkey(hotkey, event)) {
        if (predicate(editor) && isNodeTypeIn(editor, types)) {
          event.preventDefault();

          Transforms.setNodes(editor, { type: defaultType });

          onReset?.(editor);
        }
      }
    });
  }
};
