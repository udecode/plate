import type { AnyEditor as Editor } from '../interfaces/editor';
import { NO_CARET, type SettledCaret, storedCaret } from './set-root';

const CURRENT_CARET = new WeakMap<Editor, SettledCaret>();

export const getSelectionStateCaret = (editor: Editor): SettledCaret =>
  CURRENT_CARET.get(editor) ?? NO_CARET;

export const setSelectionStateCaret = (editor: Editor, caret: SettledCaret) => {
  CURRENT_CARET.set(editor, storedCaret(caret));
};
