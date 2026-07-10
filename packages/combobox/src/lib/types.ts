import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';

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
  createComboboxInput?: (trigger: string) => Element;
  triggerQuery?: (editor: BaseEditor) => boolean;
};
