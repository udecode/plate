import React from 'react';

import type { TElement } from '@udecode/slate';

import type { AnySlatePlugin } from '../../plugin';
import type { BoxStaticProps, SlateRenderElementProps } from '../types';

export type SlateElementProps<
  N extends TElement = TElement,
  P extends AnySlatePlugin = AnySlatePlugin,
> = {
  /** Get HTML attributes from Slate element. Alternative to `PlatePlugin.props`. */
  elementToAttributes?: (element: N) => any;
} & BoxStaticProps &
  SlateRenderElementProps<N, P>;

export const SlateElement = (props: SlateElementProps) => {
  const {
    as,
    attributes,
    children,
    className,
    element,
    nodeProps,
    style,
    ...rest
  } = props;

  const {
    api,
    editor,
    getOption,
    getOptions,
    plugin,
    setOption,
    setOptions,
    tf,
    type,
    ...restProps
  } = rest as any;

  const Element = (as ?? 'div') as any;

  return (
    <Element
      {...attributes}
      {...nodeProps}
      {...restProps}
      className={className}
      style={style}
    >
      {children}
    </Element>
  );
};
