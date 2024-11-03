import React from 'react';

import type { TText } from '@udecode/slate';

import { clsx } from 'clsx';

import { type PlateRenderLeafProps, omitPluginContext } from '../plugin';

type DefaultLeafProps = {
  leafToAttributes?: (leaf: TText) => any;
} & PlateRenderLeafProps &
  React.HTMLAttributes<HTMLSpanElement>;

const useDefaultLeaf = (props: DefaultLeafProps) => {
  const { attributes, leaf, leafToAttributes, nodeProps, text, ...rootProps } =
    omitPluginContext(props as any);

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...leafToAttributes?.(leaf),
      className: clsx(props.className, nodeProps?.className),
    },
  };
};

export function DefaultLeaf(props: DefaultLeafProps) {
  const { props: rootProps } = useDefaultLeaf(props);

  return <span {...rootProps} />;
}
