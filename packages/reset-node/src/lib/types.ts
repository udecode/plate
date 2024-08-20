import type { HotkeyPluginOptions, SlateEditor } from '@udecode/plate-common';

export interface ResetNodePluginRule extends HotkeyPluginOptions {
  /** Additional condition to the rule. */
  predicate: (editor: SlateEditor) => boolean;

  /** Node types where the rule applies. */
  types: string[];

  defaultType?: string;

  /** Callback called when resetting. */
  onReset?: (editor: SlateEditor) => void;
}

export interface ResetNodePluginOptions {
  disableEditorReset?: boolean;
  disableFirstBlockReset?: boolean;
  rules?: ResetNodePluginRule[];
}
