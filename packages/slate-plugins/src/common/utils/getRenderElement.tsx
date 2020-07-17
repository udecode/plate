import * as React from 'react';
import { pickBy } from 'lodash';
import { RenderElementProps } from 'slate-react';
import { RenderNodeOptions } from '../types/PluginOptions.types';

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
}: RenderElementProps) => {
  if (props.element.type === type) {
    return <Component {...attributes} {...props} {...pickBy(rootProps)} />;
  }
};

/**
 * Get a `renderElement` handler for multiple types.
 */
export const getRenderElements = (options: Required<RenderNodeOptions>[]) => ({
  attributes,
  ...props
}: RenderElementProps) => {
  for (const { type, component: Component, rootProps } of options) {
    if (props.element.type === type) {
      return <Component {...attributes} {...props} {...pickBy(rootProps)} />;
    }
  }
};
