import React from 'react';

import type { TText } from '@udecode/slate';

import { clsx } from 'clsx';

import { type PlateRenderLeafProps, omitPluginContext } from '../plugin';

type DefaultLeafProps = {
  leafToAttributes?: (leaf: TText) => any;
} & PlateRenderLeafProps &
  React.HTMLAttributes<HTMLSpanElement>;

const useDefaultLeaf = (props: DefaultLeafProps) => {
  const {
    attributes,
    leaf,
    leafPosition,
    leafToAttributes,
    nodeProps,
    text,
    ...rootProps
  } = omitPluginContext(props as any);

  const className = clsx(props.className, nodeProps?.className);

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...leafToAttributes?.(leaf),
      className: className || undefined,
    },
  };
};

export function DefaultLeaf(props: DefaultLeafProps) {
  const { props: rootProps } = useDefaultLeaf(props);

  return <span {...rootProps} />;
}
