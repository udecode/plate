import { FunctionComponent } from 'react';
import { DeserializeOptions } from './DeserializeOptions';
import { GetNodeProps } from './GetNodeProps';

/**
 * React component rendering a slate element or leaf.
 * @default DefaultElement | DefaultLeaf
 */
export type SlatePluginComponent = FunctionComponent | null | undefined;

export interface SlatePluginOptions {
  [key: string]: any;

  /**
   * Element or mark type.
   * @default plugin key
   */
  type: string;

  component?: SlatePluginComponent;

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

/**
 * A unique key to store the plugin options by key.
 */
export type PluginKey = string;

/**
 * Slate plugins options stored by plugin key.
 * Each plugin can access the options by its plugin key.
 *
 * @default {}
 * @see {@link PluginKey}
 */
export type SlatePluginsOptions = Record<PluginKey, SlatePluginOptions>;
