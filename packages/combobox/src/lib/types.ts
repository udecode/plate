import type { Element } from '@platejs/slate';

import type { SlateEditor } from 'platejs';

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
  triggerQuery?: (editor: SlateEditor) => boolean;
};
