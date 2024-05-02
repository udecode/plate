import { PlateEditor, TElement } from '@udecode/plate-common';

export interface TriggerComboboxPlugin {
  trigger?: string;
  triggerPreviousCharPattern?: RegExp;
  triggerQuery?: (editor: PlateEditor) => boolean;
  createComboboxInput?: () => TElement;
}

export type ComboboxInputCursorState = {
  atStart: boolean;
  atEnd: boolean;
};

export type CancelComboboxInputCause =
  | 'manual'
  | 'escape'
  | 'backspace'
  | 'arrowLeft'
  | 'arrowRight'
  | 'deselect'
  | 'blur';

export type BaseComboboxItem<OnSelectArgs extends any[] = []> = {
  value: string;
  keywords?: string[];
  onSelect?: (...args: OnSelectArgs) => void;
};

export type BaseComboboxItemWithEditor = BaseComboboxItem<[PlateEditor]>;
