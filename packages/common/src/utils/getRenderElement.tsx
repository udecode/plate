import * as React from 'react';
import { DefaultElement } from 'slate-react';
import { ElementToProps } from '../types/NodeToProps';
import { RenderElementPropsWithAttributes } from '../types/RenderElementPropsWithAttributes';
import { RenderNodeOptions } from '../types/RenderNodeOptions';
import { getSlateClass } from './getSlateClass';

export interface GetRenderElementOptions
  extends RenderNodeOptions,
    ElementToProps {}

/**
 * Get a `renderElement` handler for a single type.
 * If the given `type` is equals to the slate element type, render the given `component`.
 */
export const getRenderElement = ({
  type,
  component: Element = DefaultElement,
  nodeToProps,
}: GetRenderElementOptions) => ({
  attributes,
  element,
  children,
}: RenderElementPropsWithAttributes) => {
  if (element.type === type) {
    const htmlAttributes =
      nodeToProps?.({ attributes, element, children }) ?? element?.attributes;

    return (
      <Element
        attributes={attributes}
        htmlAttributes={htmlAttributes}
        element={element}
        className={getSlateClass(type)}
      >
        {children}
      </Element>
    );
  }
};

/**
 * Get a `renderElement` handler for multiple types.
 */
export const getRenderElements = (options: GetRenderElementOptions[]) => ({
  attributes,
  element,
  children,
}: RenderElementPropsWithAttributes) => {
  for (const {
    type,
    component: Element = DefaultElement,
    nodeToProps,
  } of options) {
    if (element.type === type) {
      const htmlAttributes =
        nodeToProps?.({ attributes, element, children }) ?? element?.attributes;

      return (
        <Element
          attributes={attributes}
          htmlAttributes={htmlAttributes}
          element={element}
          className={getSlateClass(type)}
        >
          {children}
        </Element>
      );
    }
  }
};
