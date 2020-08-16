import React, { forwardRef } from 'react';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';
import { Selectable } from './Selectable';
import {
  ElementWithId,
  SelectableStyleProps,
  SelectableStyles,
} from './Selectable.types';

export const getSelectableElement = ({
  component: Component,
  styles,
}: {
  component: any;
  styles?: IStyleFunctionOrObject<SelectableStyleProps, SelectableStyles>;
}) =>
  forwardRef(({ attributes, element, ...props }: RenderElementProps, ref) => {
    return (
      <Selectable
        attributes={attributes}
        componentRef={ref}
        element={element as ElementWithId}
        styles={styles}
      >
        <Component attributes={attributes} element={element} {...props} />
      </Selectable>
    );
  });
