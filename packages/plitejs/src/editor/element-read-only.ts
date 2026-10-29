import type { AnyEditor, EditorStaticApi } from '../interfaces/editor';
import {
  above as editorAbove,
  isElementReadOnly as editorIsElementReadOnly,
  isInline as editorIsInline,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { NodeApi } from '../interfaces/node';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';

export const elementReadOnly: EditorStaticApi['elementReadOnly'] = (
  editor,
  options = {}
) =>
  editorAbove(editor, {
    ...options,
    match: (n): n is Element =>
      NodeApi.isElement(n) && editorIsElementReadOnly(editor, n),
  });

export const refusesReadOnlyWrite = (editor: AnyEditor, at: Point | Range) => {
  const readOnly = elementReadOnly(editor, { at });

  if (RangeApi.isRange(at) && RangeApi.isExpanded(at)) {
    return !!readOnly && editorIsInline(editor, readOnly[0]);
  }

  return !!readOnly;
};
