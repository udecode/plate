import { ElementType } from 'react';
import { useElementProps, UseElementPropsOptions } from '../../hooks/index';
import { TElement, Value } from '../../../../slate-utils/src/slate/index';
import { As, HTMLPropsAs, PlateRenderElementProps } from '../../types/index';
import { createComponentAs, createElementAs } from '../react/index';

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
