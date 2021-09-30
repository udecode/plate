import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { usePopper } from 'react-popper';
import * as PopperJS from '@popperjs/core';
import { Modifier } from '@popperjs/core';
import { getSelectionBoundingClientRect } from './getSelectionBoundingClientRect';

export type UsePopperOptions = Omit<Partial<PopperJS.Options>, 'modifiers'> & {
  createPopper?: typeof PopperJS.createPopper;
  modifiers?: ReadonlyArray<Partial<Modifier<string, object>>>;
};

export interface UsePopperPositionOptions {
  popperElement: HTMLElement | null;
  popperContainer?: Document | HTMLElement | null;
  popperOptions?: UsePopperOptions | null;
  modifiers?: UsePopperOptions['modifiers'];
  placement?: PopperJS.Placement;
  isHidden?: boolean;
  getBoundingClientRect?: any;
  offset?: number[];
}

export type UsePopperPositionReturnType = [
  { [key: string]: React.CSSProperties },
  {
    [key: string]:
      | {
          [key: string]: string;
        }
      | undefined;
  },
  boolean
];

const virtualReference: PopperJS.VirtualElement = {
  getBoundingClientRect() {
    return {
      top: -9999,
      left: -9999,
      bottom: 9999,
      right: 9999,
      width: 90,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => null,
    };
  },
};

/**
 * TODO: duplicate
 */
export const usePopperPosition = ({
  popperElement,
  popperContainer = document,
  popperOptions = {},
  modifiers = [],
  offset = [0, 0],
  placement = 'auto',
  isHidden = false,
  getBoundingClientRect = getSelectionBoundingClientRect,
}: UsePopperPositionOptions): UsePopperPositionReturnType => {
  const { styles, attributes, update } = usePopper(
    virtualReference,
    popperElement,
    {
      placement,
      modifiers: [
        // default modifiers to position the popper correctly
        {
          name: 'preventOverflow',
          enabled: true,
          options: { boundary: popperContainer ?? undefined },
        },
        {
          name: 'flip',
          enabled: true,
          options: { padding: 8 },
        },
        {
          name: 'eventListeners',
          enabled: true,
          options: { scroll: !isHidden, resize: true },
        },
        {
          name: 'offset',
          options: {
            offset,
          },
        },
        // user modifiers to override the default
        ...modifiers,
      ],
      strategy: 'absolute',
      ...(popperOptions as any),
    }
  );

  const updatePosition = useCallback(() => {
    if (isHidden) return;
    if (!popperElement) return;

    virtualReference.getBoundingClientRect = getBoundingClientRect;
    update?.();
  }, [getBoundingClientRect, isHidden, popperElement, update]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    popperContainer?.addEventListener('scroll', updatePosition);
    return () => popperContainer?.removeEventListener('scroll', updatePosition);
  }, [updatePosition, popperContainer]);

  return [styles, attributes, isHidden];
};
