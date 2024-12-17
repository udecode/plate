import React from 'react';

import type { TText } from '@udecode/slate';
import type { DecoratedRange } from 'slate';

import type { AnySlatePlugin } from '../../plugin';
import type { SlateRenderLeafProps, TextStaticProps } from '../types';

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
  const {
    as,
    attributes,
    children,
    className,
    decorations,
    leaf,
    text,
    ...rest
  } = props;

  const Leaf = (as ?? 'span') as any;

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

  return (
    <Leaf className={className} {...attributes} {...restProps}>
      {children}
    </Leaf>
  );
}
