import React from 'react';

import type { DecoratedRange, TText } from '@udecode/slate';

import clsx from 'clsx';

import type { AnySlatePlugin } from '../../plugin';
import type { SlateRenderLeafProps } from '../types';

import { omitPluginContext } from '../../utils';

export type SlateLeafProps<
  T extends TText = TText,
  P extends AnySlatePlugin = AnySlatePlugin,
> = {
  decorations?: DecoratedRange[];
  /** Get HTML attributes from Slate leaf. Alternative to `PlatePlugin.props`. */
  leafToAttributes?: (leaf: T) => any;
} & SlateRenderLeafProps<T, P> &
  React.ComponentProps<'span'> & {
    as?: React.ElementType;
  };

export const SlateLeaf = React.forwardRef<HTMLSpanElement, SlateLeafProps>(
  (props, ref) => {
    const {
      as,
      attributes,
      leaf,
      leafPosition,
      leafToAttributes,
      text,
      ...rest
    } = omitPluginContext(props);

    const className = clsx(props.className, attributes?.className);

    const rootProps = {
      ...rest,
      ...attributes,
      ...leafToAttributes?.(leaf),
      className: className || undefined,
    };

    const Leaf = (as ?? 'span') as any;

    return <Leaf {...rootProps} ref={ref} />;
  }
);
