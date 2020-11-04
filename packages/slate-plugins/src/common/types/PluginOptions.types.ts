import {
  GetElementDeserializerOptions,
  GetLeafDeserializerOptions,
} from '../utils';

export type DeserializerOptions =
  | GetElementDeserializerOptions
  | GetLeafDeserializerOptions;

export interface Deserialize extends RenderNodeOptions {
  /**
   * `getElementDeserializer` and `getLeafDeserializer` options
   */
  deserialize?: Partial<DeserializerOptions>;
}

/**
 * Props of the root component of the component to render.
 */
export interface RenderNodePropsOptions {
  /**
   * Additional class name to provide on the root element.
   */
  className?: string;

  as?: any;
}

export interface HotkeyOptions {
  /**
   * Hotkey to toggle node type
   */
  hotkey?: string | string[];

  defaultType?: string;
}

/**
 * `renderElement` and `renderLeaf` option values
 */
export interface RenderNodeOptions
  extends RootProps<RenderNodePropsOptions>,
    HotkeyOptions {
  /**
   * Type of the node.
   */
  type?: string;

  /**
   * React component of the node.
   */
  component?: any;
}

export interface RootProps<T> {
  /**
   * Props of the root component of the React component to render. Falsy props are ignored.
   */
  rootProps?: T;
}
