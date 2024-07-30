import type {
  HotkeyPluginOptions,
  PlateEditor,
} from '@udecode/plate-common/server';

export interface ResetNodePluginRule extends HotkeyPluginOptions {
  /** Additional condition to the rule. */
  predicate: (editor: PlateEditor) => boolean;

  /** Node types where the rule applies. */
  types: string[];

  defaultType?: string;

  /** Callback called when resetting. */
  onReset?: (editor: PlateEditor) => void;
}

export interface ResetNodePluginOptions {
  disableEditorReset?: boolean;
  disableFirstBlockReset?: boolean;
  rules?: ResetNodePluginRule[];
}
