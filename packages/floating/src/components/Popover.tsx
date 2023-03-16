import React, { cloneElement, ReactNode } from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react-dom-interactions';
import { UseFloatingProps } from '@floating-ui/react-dom-interactions/src/types';
import { createElementAs, HTMLPropsAs } from '@udecode/plate-common';
import { useInteractions } from '../floating-ui';

export interface PopoverOptions {
  /**
   * Whether the popover is disabled
   */
  disabled?: boolean;
}

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
  const { x, y, reference, floating, strategy } = useFloating({
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
        getReferenceProps({ ref: reference, ...children.props })
      )}

      {floatingOptions?.open &&
        createElementAs('div', {
          ref: floating,
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
