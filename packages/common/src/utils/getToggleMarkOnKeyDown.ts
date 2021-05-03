import {
  getSlatePluginOptions,
  KeyboardHandler,
  SPEditor,
} from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { toggleMark } from '../transforms/toggleMark';

export const getToggleMarkOnKeyDown = <T extends SPEditor = SPEditor>(
  pluginKey: string
): KeyboardHandler<T> => (editor) => (e) => {
  const { hotkey, type, clear } = getSlatePluginOptions(editor, pluginKey);

  if (!hotkey) return;

  if (isHotkey(hotkey, e as KeyboardEvent)) {
    e.preventDefault();

    toggleMark(editor, type, clear);
  }
};
