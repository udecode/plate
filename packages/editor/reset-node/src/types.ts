import { HotkeyPlugin, PlateEditor, Value } from '@udecode/plate-core';

export interface ResetNodePluginRule extends HotkeyPlugin {
  defaultType?: string;

  /**
   * Node types where the rule applies.
   */
  types: string[];

  /**
   * Additional condition to the rule.
   */
  predicate: <V extends Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ) => boolean;

  /**
   * Callback called when resetting.
   */
  onReset?: <V extends Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ) => void;
}

export interface ResetNodePlugin {
  rules?: ResetNodePluginRule[];
}
