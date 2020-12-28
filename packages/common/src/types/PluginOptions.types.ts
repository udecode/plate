import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export interface GetNodeDeserializerRule {
  /**
   * Required node names to deserialize the element.
   * Set '*' to allow any node name.
   */
  nodeNames?: string | string[];

  /**
   * Required className to deserialized the element.
   */
  className?: string;

  /**
   * Required style to deserialize the element. Each value should be a (list of) string.
   */
  style?: Partial<
    Record<keyof CSSStyleDeclaration, string | string[] | undefined>
  >;
}

export interface GetNodeDeserializerOptions {
  type: string;

  /**
   * Slate node creator from HTML element.
   */
  node: (el: HTMLElement) => { [key: string]: any } | undefined;

  /**
   * List of html attributes to store with the node
   */
  attributes?: string[];

  /**
   * List of rules the element needs to follow to be deserialized to a slate node.
   */
  rules: GetNodeDeserializerRule[];
}

export interface GetLeafDeserializerOptions
  extends WithOptional<GetNodeDeserializerOptions, 'node'> {
  type: string;
}

export interface GetElementDeserializerOptions
  extends WithOptional<GetNodeDeserializerOptions, 'node'> {
  type: string;
}

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
