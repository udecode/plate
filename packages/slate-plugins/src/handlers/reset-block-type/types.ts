export interface WithResetBlockTypeOptions {
  /**
   * Node types where the plugin applies.
   */
  types: string[];
  /**
   * Default type to set when resetting.
   */
  defaultType?: string;
  /**
   * Callback called when unwrapping.
   */
  onUnwrap?: any;
}
