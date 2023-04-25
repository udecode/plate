import { ElementType } from 'react';
import { PlateRenderElementProps } from '@udecode/plate-core';
import { TElement, Value } from '@udecode/slate';
import { useElementProps, UseElementPropsOptions } from '../hooks';
import { As, HTMLPropsAs } from '../types';
import { createComponentAs } from './createComponentAs';
import { createElementAs } from './createElementAs';

export type CreatePlateElementComponentOptions<
  T extends TElement = TElement,
  A extends As = 'div'
> = {
  as?: ElementType;
} & Pick<UseElementPropsOptions<T, A>, 'elementToAttributes'>;

/**
 * Create the top-level React component for a Slate element.
 */
export const createPlateElementComponent = <
  T extends TElement = TElement,
  A extends As = 'div'
>({
  as = 'div',
  elementToAttributes,
}: CreatePlateElementComponentOptions<T, A> = {}) =>
  createComponentAs<PlateRenderElementProps<Value, T> & HTMLPropsAs<A>>(
    (props) => {
      const htmlProps = useElementProps<T, A>({
        ...(props as any),
        elementToAttributes,
      });

      return createElementAs(as, htmlProps);
    }
  );
