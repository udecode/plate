import { PlateEditor, TElement } from '@udecode/plate-common';

export interface TriggerComboboxPlugin {
  combobox?: {
    trigger?: string;
    triggerPreviousCharPattern?: RegExp;
    query?: (editor: PlateEditor) => boolean;
    createInputNode?: () => TElement;
  };
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
  label: string;
  aliases?: string[];
  onSelect?: (...args: OnSelectArgs) => void;
};

export type BaseComboboxItemWithEditor = BaseComboboxItem<[PlateEditor]>;
