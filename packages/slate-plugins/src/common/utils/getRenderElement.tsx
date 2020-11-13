import * as React from 'react';
import pickBy from 'lodash/pickBy';
import {
  NodeToProps,
  NodeToPropsOptions,
  RenderElementPropsWithAttributes,
  RenderNodeOptions,
} from '../types/PluginOptions.types';

export interface GetRenderElementOptions
  extends Required<RenderNodeOptions>,
    NodeToProps<NodeToPropsOptions> {}

/**
 * Get a `renderElement` handler for a single type.
 * If the given `type` is equals to the slate element type, render the given `component`.
 * You can pass props by using `rootProps`. Falsy props are ignored.
 */
export const getRenderElement = ({
  type,
  component: Component,
  rootProps,
  nodeToProps,
}: GetRenderElementOptions) => ({
  attributes,
  element,
  children,
}: RenderElementPropsWithAttributes) => {
  if (element.type === type) {
    const htmlAttributes =
      nodeToProps?.({ attributes, element, children, rootProps }) ??
      element?.attributes;
    return (
      <Component
        attributes={attributes}
        htmlAttributes={htmlAttributes}
        element={element}
        {...pickBy(rootProps)}
      >
        {children}
      </Component>
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
    component: Component,
    rootProps,
    nodeToProps,
  } of options) {
    if (element.type === type) {
      const htmlAttributes =
        nodeToProps?.({ attributes, element, children, rootProps }) ??
        element?.attributes;
      return (
        <Component
          attributes={attributes}
          htmlAttributes={htmlAttributes}
          element={element}
          {...pickBy(rootProps)}
        >
          {children}
        </Component>
      );
    }
  }
};
