import React from 'react';

import type { TText } from '@udecode/slate';

import type { AnySlatePlugin } from '../../plugin';
import type { PlateRenderLeafStaticProps, TextStaticProps } from '../types';

export type PlateLeafStaticProps<
  T extends TText = TText,
  P extends AnySlatePlugin = AnySlatePlugin,
> = {
  /** Get HTML attributes from Slate leaf. Alternative to `PlatePlugin.props`. */
  leafToAttributes?: (leaf: T) => any;
} & PlateRenderLeafStaticProps<T, P> &
  TextStaticProps;

export function PlateLeafStatic(props: PlateLeafStaticProps) {
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
