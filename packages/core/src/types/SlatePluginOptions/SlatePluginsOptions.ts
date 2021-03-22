import { DeserializeOptions } from './DeserializeOptions';
import { GetNodeProps } from './GetNodeProps';

export interface SlatePluginOptions {
  [key: string]: any;

  /**
   * Element or mark type.
   * @default plugin key
   */
  type: string;

  /**
   * React component to render a slate element or leaf.
   * @default DefaultElement | DefaultLeaf
   */
  component?: any;

  /**
   * Default type of slate blocks.
   * @default 'p'
   */
  defaultType?: string;

  /**
   * Hotkeys to listen to trigger a plugin action.
   */
  hotkey?: string | string[];

  /**
   * Node fields to clear.
   */
  clear?: string | string[];

  /**
   * @see {@link GetNodeProps}
   */
  getNodeProps?: GetNodeProps;

  /**
   * `getElementDeserializer` and `getLeafDeserializer` options
   */
  deserialize?: Partial<DeserializeOptions>;
}

export type SlatePluginsOptions = Record<string, SlatePluginOptions>;
