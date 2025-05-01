import React from 'react';

import type { TText } from '@udecode/slate';

import { clsx } from 'clsx';

import { type PlateRenderTextProps, omitPluginContext } from '../plugin';

type DefaultTextProps = {
  textToAttributes?: (text: TText) => any;
} & PlateRenderTextProps &
  React.HTMLAttributes<HTMLSpanElement>;

const useDefaultText = (props: DefaultTextProps) => {
  const { attributes, nodeProps, text, textToAttributes, ...rootProps } =
    omitPluginContext(props as any);

  const className = clsx(props.className, nodeProps?.className);

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...textToAttributes?.(text),
      className: className || undefined,
    },
  };
};

export function DefaultText(props: DefaultTextProps) {
  const { props: rootProps } = useDefaultText(props);

  return <span {...rootProps} />;
}
