import * as React from 'react';
import pickBy from 'lodash/pickBy';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import {
  AttributesToProps,
  DeserializedAttributes,
  RenderNodeOptions,
} from '../types/PluginOptions.types';

export interface GetRenderElementOptions {
  /**
   * Type of the element.
   */
  type: string;
  /**
   * React component to render the element.
   */
  component: any;

  /**
   * Options passed to the component as props.
   */
  [key: string]: any;
}

export interface ElementWithAttributes extends Element {
  attributes?: DeserializedAttributes;
}

export interface RenderElementPropsWithAttributes extends RenderElementProps {
  element: ElementWithAttributes;
}

export interface GetHtmlAttributes {
  attributes?: DeserializedAttributes;
  attributesToProps?: AttributesToProps;
}

const getHtmlAttributes = ({
  attributes,
  attributesToProps,
}: GetHtmlAttributes) => {
  if (attributes && attributesToProps)
    return pickBy(attributesToProps(attributes));
  if (attributes) return pickBy(attributes);
};

/**
 * Get a `renderElement` handler for a single type.
 * If the given `type` is equals to the slate element type, render the given `component`.
 * You can pass props by using `rootProps`. Falsy props are ignored.
 */
export const getRenderElement = ({
  type,
  component: Component,
  rootProps,
}: Required<RenderNodeOptions>) => ({
  attributes,
  ...props
}: RenderElementPropsWithAttributes) => {
  if (props.element.type === type) {
    const htmlAttributes = getHtmlAttributes({
      attributes: props.element?.attributes,
      attributesToProps: rootProps.attributesToProps,
    });
    return (
      <Component
        attributes={attributes}
        htmlAttributes={htmlAttributes}
        {...props}
        {...pickBy(rootProps)}
      />
    );
  }
};

/**
 * Get a `renderElement` handler for multiple types.
 */
export const getRenderElements = (options: Required<RenderNodeOptions>[]) => ({
  attributes,
  element,
  children,
}: RenderElementPropsWithAttributes) => {
  for (const { type, component: Component, rootProps } of options) {
    if (element.type === type) {
      const htmlAttributes = getHtmlAttributes({
        attributes: element?.attributes,
        attributesToProps: rootProps.attributesToProps,
      });
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
