import { Element, Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { ElementWithAttributes } from './ElementWithAttributes';
import { RenderElementPropsWithAttributes } from './RenderElementPropsWithAttributes';

export type HtmlAttributes = { [key: string]: any } | undefined;

export interface HtmlAttributesProps {
  htmlAttributes?: HtmlAttributes;
}

export interface ElementNode<T = Element> {
  [key: string]: any;
  element: T;
}

export interface ElementToPropsOptions
  extends Omit<RenderElementPropsWithAttributes, 'element'>,
    ElementNode<ElementWithAttributes> {}

export interface ElementToProps {
  /**
   * Function to evaluate a node's attributes, element, children to generate new props
   */
  nodeToProps?: (options: ElementToPropsOptions) => HtmlAttributes;
}

export interface LeafNode<TLeaf = Text> {
  [key: string]: any;
  leaf: TLeaf;
}

export interface LeafToPropsOptions
  extends Pick<RenderLeafProps, 'text'>,
    LeafNode {}

export interface LeafToProps {
  /**
   * Function to evaluate a node's attributes, leaf to generate new props
   */
  nodeToProps?: (options: LeafToPropsOptions) => HtmlAttributes;
}
