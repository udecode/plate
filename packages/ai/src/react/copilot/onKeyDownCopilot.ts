import {
  insertText,
  isHotkey,
  withoutMergingHistory,
} from '@udecode/plate-common';
import { type KeyboardHandler, Hotkeys } from '@udecode/plate-common/react';

import { type CopilotPluginConfig, CopilotPlugin } from './CopilotPlugin';
import { generateCopilotText } from './generateCopilotText';
import { withoutAbort } from './utils/withoutAbort';

export const onKeyDownCopilot: KeyboardHandler<CopilotPluginConfig> = ({
  editor,
  event,
  getOptions,
  setOptions,
}) => {
  if (event.defaultPrevented) return;

  const {
    copilotState: state,
    enableShortCut = true,
    suggestionText: completionText,
  } = getOptions();

  if (state === 'completed' && Hotkeys.isTab(editor, event)) {
    event.preventDefault();
    withoutMergingHistory(editor, () => {
      insertText(editor, completionText!);
    });
  }
  if (isHotkey('ctrl+space')(event) && enableShortCut) {
    void generateCopilotText(editor, { event, isDebounce: false });
  }
  if (isHotkey('cmd+right')(event) && state === 'completed') {
    event.preventDefault();
    const text = completionText!;
    // TODO: support Chinese.
    const firstWord = /^\s*\S+/.exec(text)?.[0] || '';
    const remainingText = text.slice(firstWord.length);

    setOptions({ suggestionText: remainingText });

    withoutAbort(editor, () => {
      withoutMergingHistory(editor, () => {
        insertText(editor, firstWord);
      });
    });
  }
  if (state === 'completed' && isHotkey('escape')(event)) {
    event.preventDefault();
    event.stopPropagation();

    return editor.getApi(CopilotPlugin).copilot.abortCopilot();
  }
};
