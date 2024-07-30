import type React from 'react';

import type { TReactEditor } from '@udecode/plate-common';
import type { Location } from 'slate';

import { getBoundingClientRect } from './getBoundingClientRect';

export type VirtualRef = React.RefObject<
  Pick<HTMLElement, 'getBoundingClientRect'>
>;

export const createVirtualRef = (
  editor: TReactEditor,
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
