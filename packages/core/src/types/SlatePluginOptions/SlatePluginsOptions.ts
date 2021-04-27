import { FunctionComponent } from 'react';
import { SPRenderElementProps } from '../SPRenderElementProps';
import { SPRenderLeafProps } from '../SPRenderLeafProps';
import { DeserializeOptions } from './DeserializeOptions';
import { GetNodeProps } from './GetNodeProps';

/**
 * React component rendering a slate element or leaf.
 * @default DefaultElement | DefaultLeaf
 */
export type SlatePluginComponent = FunctionComponent<
  SPRenderElementProps | SPRenderLeafProps
>;

export interface SlatePluginOptions {
  [key: string]: any;

  /**
   * Node properties to delete.
   */
  clear?: string | string[];

  /**
   * `SlatePlugins` maps each slate node to this component to render.
   */
  component?: SlatePluginComponent;

  /**
   * Default type of slate blocks.
   * @default 'p'
   */
  defaultType?: string;

  /**
   * `getElementDeserializer` and `getLeafDeserializer` options.
   */
  deserialize?: Partial<DeserializeOptions>;

  /**
   * @see {@link GetNodeProps}
   */
  getNodeProps?: GetNodeProps;

  /**
   * Hotkeys to listen to trigger a plugin action.
   */
  hotkey?: string | string[];

  /**
   * Element or mark type.
   * @default plugin key
   */
  type: string;
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
