import React from 'react';

import type { TElement } from '@udecode/slate';

import {
  type AnyPlatePlugin,
  type PlateRenderElementProps,
  omitPluginContext,
  useEditorMounted,
} from '@udecode/plate-core/react';
import { type BoxProps, Box, useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

export type PlateElementProps<
  N extends TElement = TElement,
  P extends AnyPlatePlugin = AnyPlatePlugin,
> = {
  /** Get HTML attributes from Slate element. Alternative to `PlatePlugin.props`. */
  elementToAttributes?: (element: N) => any;
} & BoxProps &
  PlateRenderElementProps<N, P>;

export const usePlateElement = (props: PlateElementProps) => {
  const {
    attributes,
    element,
    elementToAttributes,
    nodeProps,
    path,
    ...rootProps
  } = omitPluginContext(props);
  const mounted = useEditorMounted();

  const block = React.useMemo(
    () => mounted && !!element.id && props.editor.api.isBlock(element),
    [element, props.editor, mounted]
  );

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...elementToAttributes?.(element),
      className: clsx(props.className, nodeProps?.className),
      'data-block-id': block ? element.id : undefined,
      style: {
        position: 'relative',
        ...props.style,
        ...nodeProps?.style,
      },
    },
    ref: useComposedRef(props.ref, attributes.ref),
  };
};

/** Headless element component. */
export const PlateElement = React.forwardRef(function PlateElement<
  N extends TElement = TElement,
  P extends AnyPlatePlugin = AnyPlatePlugin,
>(props: PlateElementProps<N, P>, ref: React.ForwardedRef<HTMLDivElement>) {
  const { props: rootProps, ref: rootRef } = usePlateElement({
    ...props,
    ref,
  } as any);
  const { children, ...rest } = rootProps;

  const belowRootComponents = React.useMemo(
    () =>
      props.editor.pluginList
        .map((plugin) => plugin.render.belowRootNodes!)
        .filter(Boolean),
    [props.editor.pluginList]
  );

  return (
    <Box {...rest} ref={rootRef}>
      {children}

      {belowRootComponents.map((Component, index) => (
        <Component key={index} {...(props as any)} />
      ))}
    </Box>
  );
}) as React.ForwardRefExoticComponent<
  PlateElementProps & React.RefAttributes<HTMLDivElement>
>;

PlateElement.displayName = 'PlateElement';
