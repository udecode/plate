import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';

export type TriggerComboboxEditor = Pick<BaseEditor, 'getType' | 'read'>;

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
  trigger?: readonly string[] | RegExp | string;
  triggerPreviousCharPattern?: RegExp;
  createComboboxInput?: (trigger: string) => Element;
  triggerQuery?: (editor: TriggerComboboxEditor) => boolean;
};
