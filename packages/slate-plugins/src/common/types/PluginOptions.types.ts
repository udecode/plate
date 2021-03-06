import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
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

export type DeserializedAttributes = { [key: string]: any } | undefined;

export interface ElementWithAttributes extends Element {
  attributes?: DeserializedAttributes;
}

export interface RenderElementPropsWithAttributes extends RenderElementProps {
  element: ElementWithAttributes;
}

export interface ElementNode<T = Element> {
  element: T;
}

export interface NodeToPropsOptions<
  ElementType = Element,
  RootPropsType = RenderNodePropsOptions
> extends Omit<RenderElementPropsWithAttributes, 'element'>,
    RootProps<RootPropsType> {
  element: ElementType;
}

export interface NodeToProps<
  ElementType = Element & { [key: string]: any },
  RootPropsType = RenderNodePropsOptions & { [key: string]: any }
> {
  /**
   * Function to evaluate a node's attributes, element, children, and rootProps to generate new props
   */
  nodeToProps?: (
    options: NodeToPropsOptions<ElementType, RootPropsType>
  ) => HtmlAttributes;
}

export type HtmlAttributes = { [key: string]: any } | undefined;

export interface HtmlAttributesProps {
  htmlAttributes?: HtmlAttributes;
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
