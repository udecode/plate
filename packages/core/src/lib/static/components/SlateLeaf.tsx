import React from 'react';

import type { TText } from '@udecode/slate';
import type { DecoratedRange } from 'slate';

import clsx from 'clsx';

import type { AnySlatePlugin } from '../../plugin';
import type { SlateRenderLeafProps, TextStaticProps } from '../types';

import { omitPluginContext } from '../../utils';

export type SlateLeafProps<
  T extends TText = TText,
  P extends AnySlatePlugin = AnySlatePlugin,
> = {
  decorations?: DecoratedRange[];

  /** Get HTML attributes from Slate leaf. Alternative to `PlatePlugin.props`. */
  leafToAttributes?: (leaf: T) => any;
} & SlateRenderLeafProps<T, P> &
  TextStaticProps;

export function SlateLeaf(props: SlateLeafProps) {
  const { as, attributes, leaf, leafToAttributes, nodeProps, text, ...rest } =
    omitPluginContext(props);

  const rootProps = {
    ...attributes,
    ...rest,
    ...nodeProps,
    ...leafToAttributes?.(leaf),
    className: clsx(props.className, nodeProps?.className),
  };

  const Leaf = (as ?? 'span') as any;

  return <Leaf {...rootProps} />;
}
