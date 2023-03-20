import React, { cloneElement, ReactNode } from 'react';
import { createElementAs, HTMLPropsAs } from '@udecode/plate-common';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  UseFloatingProps,
  useInteractions,
} from '../libs/floating-ui';

export interface PopoverProps extends HTMLPropsAs<'div'> {
  floatingOptions?: Partial<UseFloatingProps>;
  disabled?: boolean;
  content?: ReactNode;
  children: JSX.Element;
}

/**
 * Popover displayed over children, rendering `content`
 */
export const Popover = ({
  floatingOptions,
  children,
  content,
  ...props
}: PopoverProps) => {
  const { x, y, refs, strategy } = useFloating({
    middleware: [
      offset(12),
      flip({
        padding: 96,
      }),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
    ...floatingOptions,
  });

  const { getReferenceProps } = useInteractions();

  return (
    <>
      {cloneElement(
        children,
        getReferenceProps({ ref: refs.setReference, ...children.props })
      )}

      {floatingOptions?.open &&
        createElementAs('div', {
          ref: refs.setFloating,
          style: {
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 1,
          },
          contentEditable: false,
          children: content,
          ...props,
        })}
    </>
  );
};
