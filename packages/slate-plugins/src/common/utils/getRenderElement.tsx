import * as React from 'react';
import { GetRenderElementOptions } from '@udecode/core';
import { RenderElementProps } from 'slate-react';

/**
 * Get a renderElement handler for a type
 */
export const getRenderElement = ({
  type,
  component: Component,
  ...options
}: GetRenderElementOptions) => ({
  attributes,
  ...props
}: RenderElementProps) => {
  if (props.element.type === type) {
    return (
      <Component
        attributes={{ 'data-slate-type': type, ...attributes }}
        {...props}
        {...options}
      />
    );
  }
};

/**
 * Get multiple renderElement handlers for multiple types
 */
export const getRenderElements = (options: GetRenderElementOptions[]) => ({
  attributes,
  ...props
}: RenderElementProps) => {
  for (const { type, component: Component } of options) {
    if (props.element.type === type) {
      return (
        <Component
          attributes={{ 'data-slate-type': type, ...attributes }}
          {...props}
        />
      );
    }
  }
};
