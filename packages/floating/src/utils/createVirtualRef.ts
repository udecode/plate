import type React from 'react';

import type { Location, Value } from '@platejs/plite';
import type { DOMEditor } from '@platejs/plite-dom';

import { getBoundingClientRect } from './getBoundingClientRect';

export type VirtualRef = React.RefObject<Pick<
  HTMLElement,
  'getBoundingClientRect'
> | null>;

export const createVirtualRef = <V extends Value>(
  editor: DOMEditor<V>,
  at?: Location | Location[],
  {
    fallbackRect,
  }: {
    fallbackRect?: ClientRect;
  } = {}
): VirtualRef => ({
  current: {
    getBoundingClientRect: () => {
      const rect = getBoundingClientRect(editor, at) || fallbackRect;

      if (!rect) {
        throw new Error(
          'Could not get the bounding client rect of the location. Please provide a fallbackRect.'
        );
      }

      return rect;
    },
  },
});
