import React, {
  cloneElement,
  ComponentPropsWithoutRef,
  ReactNode,
} from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  UseFloatingProps,
  useInteractions,
} from '../libs/floating-ui';

export interface PopoverProps extends ComponentPropsWithoutRef<'div'> {
  floatingOptions?: Partial<UseFloatingProps>;
  disabled?: boolean;
  content?: ReactNode;
  children: JSX.Element;
}

/**
 * Popover displayed over children, rendering `content`
 */
export function Popover({
  floatingOptions,
  children,
  content,
  ...props
}: PopoverProps) {
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

      {floatingOptions?.open && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 1,
          }}
          contentEditable={false}
          {...props}
        >
          {children}
        </div>
      )}
    </>
  );
}
