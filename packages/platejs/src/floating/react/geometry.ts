import type { ClientRectObject } from '@floating-ui/core';
import type { VirtualElement } from '@floating-ui/react';
import type React from 'react';

import { type Location, PathApi, type Range, RangeApi } from '../../core';
import type { Editor } from '../../react/core';

export type VirtualRef = React.RefObject<Pick<
  VirtualElement,
  'getBoundingClientRect'
> | null>;

export const makeClientRect = ({
  bottom,
  left,
  right,
  top,
}: {
  bottom: number;
  left: number;
  right: number;
  top: number;
}): DOMRect => {
  const width = right - left;
  const height = bottom - top;
  const props: Omit<DOMRect, 'toJSON'> = {
    bottom,
    height,
    left,
    right,
    top,
    width,
    x: left,
    y: top,
  };

  return {
    ...props,
    toJSON: () => props,
  };
};

export const mergeClientRects = (clientRects: DOMRect[]): DOMRect => {
  if (clientRects.length === 0) {
    throw new Error('clientRects should not be empty');
  }

  return makeClientRect({
    bottom: Math.max(...clientRects.map((rect) => rect.bottom)),
    left: Math.min(...clientRects.map((rect) => rect.left)),
    right: Math.max(...clientRects.map((rect) => rect.right)),
    top: Math.min(...clientRects.map((rect) => rect.top)),
  });
};

export const getDefaultBoundingClientRect = (): ClientRectObject => ({
  bottom: 9999,
  height: 0,
  left: -9999,
  right: 9999,
  top: -9999,
  width: 0,
  x: 0,
  y: 0,
});

export const createVirtualElement = (): VirtualElement => ({
  getBoundingClientRect: getDefaultBoundingClientRect,
});

/** Get the bounding client rect for an editor range. */
export const getRangeBoundingClientRect = (
  editor: Editor,
  at: Range | null
): ClientRectObject => {
  if (!at) return getDefaultBoundingClientRect();

  return (
    editor.api.dom.resolveDOMRange(at)?.getBoundingClientRect() ??
    getDefaultBoundingClientRect()
  );
};

/** Get the bounding client rect for the expanded editor selection. */
export const getSelectionBoundingClientRect = (
  editor: Editor
): ClientRectObject => {
  const selection = editor.read.selection();

  if (selection && RangeApi.isExpanded(selection)) {
    return getRangeBoundingClientRect(editor, selection);
  }

  return getDefaultBoundingClientRect();
};

/** Get the bounding client rect for the first DOM selection range. */
export const getDOMSelectionBoundingClientRect = (): ClientRectObject => {
  const domSelection = window.getSelection();

  if (!domSelection || domSelection.rangeCount < 1) {
    return getDefaultBoundingClientRect();
  }

  return domSelection.getRangeAt(0).getBoundingClientRect();
};

export const getBoundingClientRect = (
  editor: Editor,
  at?: Location | Location[]
): DOMRect | undefined => {
  const atRanges: Range[] = (() => {
    if (!at) {
      return [...editor.read.selection.ranges()];
    }

    const atArray = Array.isArray(at) && !PathApi.isPath(at) ? at : [at];

    return atArray.flatMap((location) => {
      const range = editor.read.ranges.get(location);

      return range ? [range] : [];
    });
  })();
  const clientRects = atRanges
    .map((range) =>
      editor.api.dom.resolveDOMRange(range)?.getBoundingClientRect()
    )
    .filter((rect): rect is DOMRect => Boolean(rect));

  if (clientRects.length === 0) return undefined;

  return mergeClientRects(clientRects);
};

export const createVirtualRef = (
  editor: Editor,
  at?: Location | Location[],
  {
    fallbackRect,
  }: {
    fallbackRect?: ClientRectObject;
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
