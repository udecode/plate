import { useComposedRef } from '@udecode/slate-react-utils/src/hooks';
import { TElement } from '@udecode/slate-utils/src';
import { As, HTMLPropsAs, PlateRenderElementProps } from '../../types/index';

export type UseElementPropsOptions<
  T extends TElement = TElement,
  A extends As = 'div'
> = {
  /**
   * Get HTML attributes from Slate element. Alternative to `PlatePlugin.props`.
   */
  elementToAttributes?: (element: T) => Partial<HTMLPropsAs<A>>;
} & PlateRenderElementProps &
  HTMLPropsAs<A>;

/**
 * Get root element props for Slate element.
 */
export const useElementProps = <
  T extends TElement = TElement,
  A extends As = 'div'
>({
  attributes,
  nodeProps,
  element,
  editor,
  elementToAttributes,
  ...props
}: UseElementPropsOptions<T, A>): HTMLPropsAs<A> => {
  const htmlProps: HTMLPropsAs<'div'> = {
    ...attributes,
    ...props,
    ...nodeProps,
    ...(elementToAttributes?.(element as T) ?? {}),
    ref: useComposedRef(props.ref, attributes.ref),
  };

  return htmlProps as HTMLPropsAs<A>;
};
