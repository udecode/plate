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
  triggerQuery?: (editor: SlateEditor) => boolean;
};
