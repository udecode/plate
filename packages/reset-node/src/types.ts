import type {
  HotkeyPlugin,
  PlateEditor,
  Value,
} from '@udecode/plate-common/server';

export interface ResetNodePluginRule<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> extends HotkeyPlugin {
  /** Additional condition to the rule. */
  predicate: (editor: E) => boolean;

  /** Node types where the rule applies. */
  types: string[];

  defaultType?: string;

  /** Callback called when resetting. */
  onReset?: (editor: E) => void;
}

export interface ResetNodePlugin<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> {
  disableEditorReset?: boolean;
  disableFirstBlockReset?: boolean;
  rules?: ResetNodePluginRule<V, E>[];
}
