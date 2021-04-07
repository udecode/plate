import * as React from 'react';
import { SPRenderElementProps } from '@udecode/slate-plugins-core';
import { Placeholder } from './Placeholder';

const { forwardRef } = React;

export interface GetPlaceholderElementOptions {
  component: any;
  placeholder: string;
}

export const getPlaceholderElement = ({
  component: Component,
  placeholder,
}: GetPlaceholderElementOptions) =>
  forwardRef(({ attributes, element, ...props }: SPRenderElementProps) => {
    return (
      <Placeholder
        attributes={attributes}
        placeholder={placeholder}
        element={element}
      >
        <Component attributes={attributes} element={element} {...props} />
      </Placeholder>
    );
  });
