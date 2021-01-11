import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { getBlockAbove, isNode } from '../../common/queries';
import { SoftBreakOnKeyDownOptions } from './types';

export const onKeyDownSoftBreak = ({
  rules = [{ hotkey: 'shift+enter' }],
}: SoftBreakOnKeyDownOptions = {}) => (
  event: KeyboardEvent,
  editor: Editor
) => {
  const entry = getBlockAbove(editor);

  rules.forEach(({ hotkey, query }) => {
    if (isHotkey(hotkey, event) && isNode(entry, query)) {
      event.preventDefault();

      editor.insertText('\n');
    }
  });
};
