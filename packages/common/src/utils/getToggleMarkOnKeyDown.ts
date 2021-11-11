import { getPlatePluginOptions, KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { toggleMark } from '../transforms/toggleMark';

export const getToggleMarkOnKeyDown = <T = {}>(
  key: string
): KeyboardHandler<T> => (editor) => (e) => {
  const { hotkey, type, clear } = getPlatePluginOptions(editor, key);

  if (!hotkey) return;

  if (isHotkey(hotkey, e as any)) {
    e.preventDefault();

    toggleMark(editor, type, clear);
  }
};
