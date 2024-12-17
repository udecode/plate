import React from 'react';

import { type TElement, isBlock } from '@udecode/slate';
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

export const SlateElement = (props: SlateElementProps) => {
  const { as, attributes, element, elementToAttributes, nodeProps, ...rest } =
    omitPluginContext(props);

  const block = !!element.id && isBlock(props.editor, element);

  const rootProps = {
    ...attributes,
    ...rest,
    ...nodeProps,
    ...elementToAttributes?.(element),
    className: clsx(props.className, nodeProps?.className),
    'data-block-id': block ? element.id : undefined,
  };

  const Element = (as ?? 'div') as any;

  return <Element {...rootProps} ref={attributes.ref} />;
};
