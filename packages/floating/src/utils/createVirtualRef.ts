import React from 'react';
import { TReactEditor, Value } from '@udecode/plate-common';
import { Location } from 'slate';

import { getBoundingClientRect } from './getBoundingClientRect';

export type VirtualRef = React.RefObject<
  Pick<HTMLElement, 'getBoundingClientRect'>
>;

export const createVirtualRef = <V extends Value>(
  editor: TReactEditor<V>,
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
