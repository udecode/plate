import React from 'react';

import type { TText } from '@udecode/slate';

import clsx from 'clsx';

import type { AnySlatePlugin } from '../../plugin';
import type { SlateRenderTextProps } from '../types';

import { omitPluginContext } from '../../utils';

export type SlateTextProps<
  T extends TText = TText,
  P extends AnySlatePlugin = AnySlatePlugin,
> = {
  /** Get HTML attributes from Slate text. */
  textToAttributes?: (text: T) => any;
} & SlateRenderTextProps<T, P> &
  React.ComponentProps<'span'> & {
    as?: React.ElementType;
  };

export const SlateText = React.forwardRef<HTMLSpanElement, SlateTextProps>(
  (props, ref) => {
    const { as, attributes, children, text, textToAttributes, ...rest } =
      omitPluginContext(props);

    const className = clsx(props.className, attributes?.className);

    const rootProps = {
      ...rest,
      ...attributes,
      ...textToAttributes?.(text),
      className: className || undefined,
    };

    const Text = (as ?? 'span') as any;

    return (
      <Text {...rootProps} ref={ref}>
        {children}
      </Text>
    );
  }
);
