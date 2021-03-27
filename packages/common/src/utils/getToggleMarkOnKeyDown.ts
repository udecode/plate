import { getSlatePluginOptions, OnKeyDown } from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { toggleMark } from '../transforms/toggleMark';

export const getToggleMarkOnKeyDown = (pluginKey: string): OnKeyDown => (
  editor
) => (e) => {
  const { hotkey, type, clear } = getSlatePluginOptions(editor, pluginKey);

  if (!hotkey) return;

  if (isHotkey(hotkey, e)) {
    e.preventDefault();

    toggleMark(editor, type, clear);
  }
};
