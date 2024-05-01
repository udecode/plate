import { TriggerComboboxPlugin } from '@udecode/plate-combobox';
import { PlateEditor, TElement } from '@udecode/plate-common';

export interface TSlashInputElement extends TElement {}

export interface SlashRule {
  key: string;
  text: React.ReactNode;
  onTrigger: (editor: PlateEditor, key: string) => void;
}

export interface SlashPlugin extends TriggerComboboxPlugin {
  rules?: SlashRule[];
}
