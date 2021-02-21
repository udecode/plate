import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { getBlockAbove, queryNode } from '../../common/queries';
import { SoftBreakOnKeyDownOptions } from './types';

export const onKeyDownSoftBreak = ({
  rules = [{ hotkey: 'shift+enter' }],
}: SoftBreakOnKeyDownOptions = {}) => (
  event: KeyboardEvent,
  editor: Editor
) => {
  const entry = getBlockAbove(editor);
  if (!entry) return;

  rules.forEach(({ hotkey, query }) => {
    if (isHotkey(hotkey, event) && queryNode(entry, query)) {
      event.preventDefault();

      editor.insertText('\n');
    }
  });
};
