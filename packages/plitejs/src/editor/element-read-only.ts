import { getEditorSchema } from '../core/editor-runtime';
import type { AnyEditor, EditorStaticApi } from '../interfaces/editor';
import {
  above as editorAbove,
  isElementReadOnly as editorIsElementReadOnly,
  isInline as editorIsInline,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
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
