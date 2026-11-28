import { getEditorSchema } from '../core/editor-runtime';
import { getCompiledEditorSchemaFromApi } from '../core/editor-schema';
import { hasReadOnlyOwnerRoot } from '../core/non-writable';
import {
  getEditorUpdateRoot,
  withEditorUpdateRootScope,
} from '../core/public-state';
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
import { type Point, PointApi } from '../interfaces/point';
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

const isReadOnlyGridCellOrRow = (editor: AnyEditor, element: Element) => {
  const structure = getCompiledEditorSchemaFromApi(
    getEditorSchema(editor)
  )?.elements.byType.get(element.type)?.structure;

  return (
    structure?.kind === 'grid' &&
    (structure.role === 'cell' || structure.role === 'row')
  );
};

const hasPartialReadOnlyBlockEdge = (
  editor: AnyEditor,
  edge: Point,
  side: 'end' | 'start'
) => {
  const readOnly = elementReadOnly(editor, { at: edge, mode: 'highest' });

  if (!readOnly) return false;

  const [element, path] = readOnly;
  const schema = getEditorSchema(editor);

  if (
    schema.isInline(element) ||
    schema.isVoid(element) ||
    isReadOnlyGridCellOrRow(editor, element)
  ) {
    return false;
  }

  const blockStart = editorPoint(editor, path, { edge: 'start' });

  if (side === 'start') {
    return !PointApi.equals(edge, blockStart);
  }

  const blockEnd = editorPoint(editor, path, { edge: 'end' });

  return !PointApi.equals(edge, blockStart) && !PointApi.equals(edge, blockEnd);
};

const refusesReadOnlyWriteInCurrentRoot = (
  editor: AnyEditor,
  at: Point | Range
) => {
  if (hasEdgeInReadOnlyInline(editor, at)) return true;

  const readOnly = elementReadOnly(editor, { at, mode: 'highest' });

  if (!readOnly) {
    if (RangeApi.isRange(at) && RangeApi.isExpanded(at)) {
      const [start, end] = RangeApi.edges(at);

      return (
        hasPartialReadOnlyBlockEdge(editor, start, 'start') ||
        hasPartialReadOnlyBlockEdge(editor, end, 'end')
      );
    }

    return false;
  }

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

export const refusesReadOnlyWrite = (
  editor: AnyEditor,
  at: Point | Range
): boolean => {
  if (
    RangeApi.isRange(at) &&
    at.anchor.root !== undefined &&
    at.focus.root !== undefined &&
    at.anchor.root !== at.focus.root
  ) {
    return (
      refusesReadOnlyWrite(editor, at.anchor) ||
      refusesReadOnlyWrite(editor, at.focus)
    );
  }

  const explicitRoot = getLocationRoot(at);
  const targetRoot = explicitRoot ?? getEditorUpdateRoot(editor);

  if (hasReadOnlyOwnerRoot(editor, targetRoot)) return true;

  if (!explicitRoot) {
    return refusesReadOnlyWriteInCurrentRoot(editor, at);
  }

  return withEditorUpdateRootScope(editor, explicitRoot, () =>
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
