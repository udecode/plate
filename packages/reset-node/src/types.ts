import { HotkeyPlugin, PlateEditor, Value } from '@udecode/plate-common';

export interface ResetNodePluginRule<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends HotkeyPlugin {
  defaultType?: string;

  /**
   * Node types where the rule applies.
   */
  types: string[];

  /**
   * Additional condition to the rule.
   */
  predicate: (editor: E) => boolean;

  /**
   * Callback called when resetting.
   */
  onReset?: (editor: E) => void;
}

export interface ResetNodePlugin<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> {
  rules?: ResetNodePluginRule<V, E>[];
  disableFirstBlockReset?: boolean;
  disableEditorReset?: boolean;
}
