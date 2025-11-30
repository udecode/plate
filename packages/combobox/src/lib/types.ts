import type { SlateEditor, TElement } from 'platejs';

export type CancelComboboxInputCause =
  | 'arrowLeft'
  | 'arrowRight'
  | 'backspace'
  | 'blur'
  | 'deselect'
  | 'escape'
  | 'manual';

export type ComboboxInputCursorState = {
  atEnd: boolean;
  atStart: boolean;
};

export type TriggerComboboxPluginOptions = {
  trigger?: RegExp | string[] | string;
  triggerPreviousCharPattern?: RegExp;
  createComboboxInput?: (trigger: string) => TElement;
  /** Get current user ID for Yjs collaboration - used to set userId on combobox input */
  getUserId?: (editor: SlateEditor) => string | undefined;
  triggerQuery?: (editor: SlateEditor) => boolean;
};
