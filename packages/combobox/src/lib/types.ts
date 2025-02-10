import type { SlateEditor, TElement } from '@udecode/plate';

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

export interface TriggerComboboxPluginOptions {
  trigger?: RegExp | string[] | string;
  triggerPreviousCharPattern?: RegExp;
  createComboboxInput?: (trigger: string) => TElement;
  triggerQuery?: (editor: SlateEditor) => boolean;
}
