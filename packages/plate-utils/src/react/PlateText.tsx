import React from 'react';

import type { TText } from '@udecode/slate';

import {
  type AnyPlatePlugin,
  type PlateRenderTextProps,
  omitPluginContext,
} from '@udecode/plate-core/react';
import { type TextProps, Text } from '@udecode/react-utils';
import { clsx } from 'clsx';

export type PlateTextProps<
  T extends TText = TText,
  P extends AnyPlatePlugin = AnyPlatePlugin,
> = {
  /** Get HTML attributes from Slate text. Alternative to `PlatePlugin.props`. */
  textToAttributes?: (text: T) => any;
} & PlateRenderTextProps<T, P> &
  TextProps;

export const usePlateText = (props: PlateTextProps) => {
  const {
    leaf,
    leafPosition,
    leafToAttributes,
    nodeProps,
    text,
    textToAttributes,
    ...rootProps
  } = omitPluginContext(props) as any;

  const className = clsx(props.className, nodeProps?.className);

  return {
    props: {
      ...rootProps,
      ...nodeProps,
      ...textToAttributes?.(text),
      className: className || undefined,
    },
    ref: props.ref,
  };
};

/** Headless text component. */
const PlateText = React.forwardRef<HTMLSpanElement, PlateTextProps>(
  (props: PlateTextProps, ref) => {
    const { props: rootProps, ref: rootRef } = usePlateText({ ...props, ref });

    return <Text {...rootProps} ref={rootRef} />;
  }
) as (<N extends TText = TText, P extends AnyPlatePlugin = AnyPlatePlugin>({
  className,
  ...props
}: PlateTextProps<N, P> &
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement<any>) & {
  displayName?: string;
};
PlateText.displayName = 'PlateText';

export { PlateText };
