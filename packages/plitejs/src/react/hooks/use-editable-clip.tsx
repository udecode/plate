import { useMemo, type RefObject } from 'react';

import type { Editor, Value } from '../../index';
import {
  createRangeGeometryOwner,
  cutRects,
  type RangeGeometryOwner,
  useRangeGeometryOwner,
  type ViewportRect,
} from '../range-geometry';
import { useEditorContext } from './use-editor-context';

/** Identifies the exact mounted Editable whose visible part cuts the boxes. */
export type UseEditableClipOptions = Readonly<{
  editableRef: RefObject<HTMLElement | null>;
}>;

type EditableClip = (
  rects: Iterable<DOMRectReadOnly>
) => readonly ViewportRect[];

export const createEditableClip = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  editableRef: RefObject<HTMLElement | null>
): Readonly<{ clip: EditableClip; owner: RangeGeometryOwner }> => {
  const owner = createRangeGeometryOwner(
    editor,
    { measure: () => null, subscribe: () => () => {} },
    editableRef
  );

  return {
    clip: (rects) => {
      const area = owner.readArea();

      return area ? cutRects(rects, area) : [];
    },
    owner,
  };
};

/**
 * Cuts viewport boxes to `RangeGeometry.clipRect` of one Editable, with the
 * edge rule of `RangeGeometry.visible`. Returns [] when no part shows or no
 * Editable is mounted. It reads layout, so call it where you measure. The
 * returned function is stable.
 */
export function useEditableClip({
  editableRef,
}: UseEditableClipOptions): EditableClip {
  const editor = useEditorContext();
  const { clip, owner } = useMemo(
    () => createEditableClip(editor, editableRef),
    [editableRef, editor]
  );

  useRangeGeometryOwner(owner);

  return clip;
}
