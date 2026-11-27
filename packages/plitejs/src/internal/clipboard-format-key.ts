import { getEditorRuntimeOwner } from '../core/editor-runtime';
import type { Editor } from '../interfaces/editor';

export const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-editor-fragment';

const EDITOR_TO_CLIPBOARD_FORMAT_KEY = new WeakMap<object, string>();

// Mounted views share the clipboard key of the runtime owner that activated
// the DOM plugin.
export const setDOMClipboardFormatKey = (
  editor: Editor<any, any>,
  clipboardFormatKey: string
) => {
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.set(
    getEditorRuntimeOwner(editor),
    clipboardFormatKey
  );
};

export const clearDOMClipboardFormatKey = (editor: Editor<any, any>) => {
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.delete(getEditorRuntimeOwner(editor));
};

/** Read the configured MIME suffix used for exact Plite clipboard payloads. */
export const getDOMClipboardFormatKey = (editor: Editor<any, any>) =>
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.get(getEditorRuntimeOwner(editor)) ??
  DEFAULT_CLIPBOARD_FORMAT_KEY;
