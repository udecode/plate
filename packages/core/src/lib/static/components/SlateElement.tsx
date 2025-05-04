import React from 'react';

import type { TElement } from '@udecode/slate';

import clsx from 'clsx';

import type { AnySlatePlugin } from '../../plugin';
import type { BoxStaticProps, SlateRenderElementProps } from '../types';

import { omitPluginContext } from '../../utils';

export type SlateElementProps<
  N extends TElement = TElement,
  P extends AnySlatePlugin = AnySlatePlugin,
> = {
  /** Get HTML attributes from Slate element. Alternative to `PlatePlugin.props`. */
  elementToAttributes?: (element: N) => any;
} & BoxStaticProps &
  SlateRenderElementProps<N, P>;

export const SlateElement = React.forwardRef<HTMLDivElement, SlateElementProps>(
  (props, ref) => {
    const { as, attributes, element, elementToAttributes, ...rest } =
      omitPluginContext(props);

    const block = !!element.id && props.editor.api.isBlock(element);

    const className = clsx(props.className, attributes?.className);

    const rootProps = {
      ...rest,
      ...attributes,
      ...elementToAttributes?.(element),
      className: className || undefined,
      'data-block-id': block ? element.id : undefined,
      style: { position: 'relative', ...props.style, ...attributes?.style },
    };

    const Element = (as ?? 'div') as any;

    return <Element {...rootProps} ref={ref} />;
  }
);
