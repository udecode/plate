import isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { getBlockAboveSelection, isNodeType } from '../../common/queries';
import { SoftBreakOnKeyDownOptions } from './types';

export const onKeyDownSoftBreak = ({
  rules = [{ hotkey: 'shift+enter' }],
}: SoftBreakOnKeyDownOptions = {}) => (
  event: KeyboardEvent,
  editor: Editor
) => {
  const entry = getBlockAboveSelection(editor);

  rules.forEach(({ hotkey, query }) => {
    if (isHotkey(hotkey, event) && isNodeType(entry, query)) {
      event.preventDefault();

      editor.insertText('\n');
    }
  });
};
