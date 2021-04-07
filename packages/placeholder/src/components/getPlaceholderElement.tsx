import * as React from 'react';
import { SPRenderElementProps } from '@udecode/slate-plugins-core';
import { Placeholder } from './Placeholder';
import { PlaceholderProps } from './Placeholder.types';

const { forwardRef } = React;

export interface GetPlaceholderElementOptions
  extends Pick<PlaceholderProps, 'styles'> {
  component: any;
  placeholder: string;
  hideOnBlur?: boolean;
}

export const getPlaceholderElement = ({
  component: Component,
  placeholder,
  styles,
  hideOnBlur = true,
}: GetPlaceholderElementOptions) =>
  forwardRef(({ attributes, element, ...props }: SPRenderElementProps) => {
    return (
      <Placeholder
        attributes={attributes}
        placeholder={placeholder}
        element={element}
        styles={styles}
        hideOnBlur={hideOnBlur}
      >
        <Component attributes={attributes} element={element} {...props} />
      </Placeholder>
    );
  });
