import { getEditorSchema } from '../core/editor-runtime';
import { withEditorUpdateRoot } from '../core/public-state';
import type { AnyEditor, EditorStaticApi } from '../interfaces/editor';
import {
  above as editorAbove,
  isElementReadOnly as editorIsElementReadOnly,
  isInline as editorIsInline,
  point as editorPoint,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { getLocationRoot, stripLocationRoots } from '../internal/root-location';

export const elementReadOnly: EditorStaticApi['elementReadOnly'] = (
  editor,
  options = {}
) =>
  editorAbove(editor, {
    ...options,
    match: (n): n is Element =>
      NodeApi.isElement(n) && editorIsElementReadOnly(editor, n),
  });

const refusesReadOnlyWriteInCurrentRoot = (
  editor: AnyEditor,
  at: Point | Range
) => {
  if (hasEdgeInReadOnlyInline(editor, at)) return true;

  const readOnly = elementReadOnly(editor, { at, mode: 'highest' });

  if (!readOnly) return false;

  if (RangeApi.isRange(at) && RangeApi.isExpanded(at)) {
    if (editorIsInline(editor, readOnly[0])) return true;

    const [start, end] = RangeApi.edges(at);
    const blockStart = editorPoint(editor, readOnly[1], { edge: 'start' });
    const blockEnd = editorPoint(editor, readOnly[1], { edge: 'end' });

    return !(
      start.offset === blockStart.offset &&
      PathApi.equals(start.path, blockStart.path) &&
      end.offset === blockEnd.offset &&
      PathApi.equals(end.path, blockEnd.path)
    );
  }

  return true;
};

export const refusesReadOnlyWrite = (editor: AnyEditor, at: Point | Range) => {
  const explicitRoot = getLocationRoot(at);

  if (!explicitRoot) {
    return refusesReadOnlyWriteInCurrentRoot(editor, at);
  }

  return withEditorUpdateRoot(editor, explicitRoot, () =>
    refusesReadOnlyWriteInCurrentRoot(editor, stripLocationRoots(at))
  );
};

export const readOnlyInlineAt = (editor: AnyEditor, point: Point) => {
  const schema = getEditorSchema(editor);
  const inline = editorAbove(editor, {
    at: point,
    match: (n): n is Element =>
      NodeApi.isElement(n) && schema.isInline(n) && schema.isReadOnly(n),
    mode: 'highest',
    voids: true,
  });
  const atomic =
    inline &&
    editorAbove(editor, {
      at: point,
      match: (n) =>
        NodeApi.isElement(n) && (schema.isVoid(n) || schema.isAtom(n)),
      mode: 'highest',
      voids: true,
    });
  const atomicOwnsInline =
    !!atomic && !!inline && !PathApi.isAncestor(inline[1], atomic[1]);

  return inline && !atomicOwnsInline ? inline : undefined;
};

export const hasEdgeInReadOnlyInline = (editor: AnyEditor, at: Point | Range) =>
  (RangeApi.isRange(at) ? RangeApi.edges(at) : [at]).some(
    (edge) => !!readOnlyInlineAt(editor, edge)
  );
