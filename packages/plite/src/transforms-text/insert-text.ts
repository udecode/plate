import {
  applyOperation,
  getCurrentMarks,
  getPublicSelection,
  setCurrentMarks,
  syncImplicitTargetToCurrentSelection,
  withEditorOperationRoot,
  withEditorOperationRootChildren,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { elementReadOnly } from '../editor/element-read-only';
import {
  LocationApi,
  NodeApi,
  PathApi,
  type Point,
  RangeApi,
  type Text,
  TextApi,
  type Value,
} from '../interfaces';
import {
  getChildren as editorGetChildren,
  pointRef as editorPointRef,
  range as editorRange,
  void as editorVoid,
  withoutNormalizing as editorWithoutNormalizing,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import type {
  TextInsertTextOptions,
  TextMutationMethods,
} from '../interfaces/transforms/text';
import {
  getConsistentRangeTextMarks,
  type TextMarks,
} from '../internal/range-text-marks';
import { getLocationRoot } from '../internal/root-location';
import { getDefaultInsertLocation } from '../utils';
import { isFullDocumentRange } from './full-document-range';

const createFullDocumentTextReplacement = (
  editor: Editor,
  text: string,
  marks: TextMarks | null = null
) => {
  const first = editorGetChildren(editor)[0];
  const textNode = marks ? { text, ...marks } : { text };

  if (first && 'children' in first) {
    return [
      {
        ...first,
        children: [textNode],
      },
    ];
  }

  return [textNode];
};

const normalizeTextMarks = (marks: TextMarks | null): TextMarks | null =>
  marks && Object.keys(marks).length > 0 ? marks : null;

const textNodeHasMarks = (node: Text, marks: TextMarks | null) =>
  TextApi.equals(node, { text: '', ...(marks ?? {}) }, { loose: true });

const getPointTextInsertionPoint = (
  editor: Editor,
  at: Point,
  marks: TextMarks | null
): Point | null => {
  if (!NodeApi.has(editor, at.path)) {
    return null;
  }

  const node = NodeApi.get(editor, at.path);

  if (!TextApi.isText(node)) {
    return null;
  }

  if (textNodeHasMarks(node, marks)) {
    return at;
  }

  if (at.offset === node.text.length) {
    const nextPath = PathApi.next(at.path);
    const next = NodeApi.has(editor, nextPath)
      ? NodeApi.get(editor, nextPath)
      : null;

    if (TextApi.isText(next) && textNodeHasMarks(next, marks)) {
      return { ...at, offset: 0, path: nextPath };
    }
  }

  if (at.offset === 0 && PathApi.hasPrevious(at.path)) {
    const previousPath = PathApi.previous(at.path);
    const previous = NodeApi.has(editor, previousPath)
      ? NodeApi.get(editor, previousPath)
      : null;

    if (TextApi.isText(previous) && textNodeHasMarks(previous, marks)) {
      return {
        ...at,
        offset: previous.text.length,
        path: previousPath,
      };
    }
  }

  return null;
};

const insertTextAtPoint = (editor: Editor, at: Point, text: string) => {
  applyOperation(editor, {
    type: 'insert_text',
    path: at.path,
    offset: at.offset,
    root: at.root,
    text,
  });
};

export const applyInsertText: TextMutationMethods['insertText'] = (
  editor,
  text,
  options: TextInsertTextOptions = {}
) => {
  const explicitRoot = getLocationRoot(options.at);
  const shouldApplyPendingMarks = options.at == null && options.marks !== false;
  const insertText = () => {
    const { voids = false } = options;
    const explicitAtPreservesNullSelection =
      options.at != null && getPublicSelection(editor) == null;
    const defaultAt = options.at ?? getDefaultInsertLocation(editor);
    const preflightAt = (() => {
      if (LocationApi.isPath(defaultAt)) {
        return editorRange(editor, defaultAt);
      }

      if (LocationApi.isRange(defaultAt) && RangeApi.isCollapsed(defaultAt)) {
        return defaultAt.anchor;
      }

      return defaultAt;
    })();

    if (
      LocationApi.isPoint(preflightAt) &&
      ((!voids && editorVoid(editor, { at: preflightAt })) ||
        elementReadOnly(editor, { at: preflightAt }))
    ) {
      return;
    }

    if (
      text.length > 0 &&
      LocationApi.isRange(defaultAt) &&
      !RangeApi.isCollapsed(defaultAt) &&
      isFullDocumentRange(editor, defaultAt)
    ) {
      const replacementMarks = getConsistentRangeTextMarks(editor, defaultAt);

      applyOperation(editor, {
        children: [...editorGetChildren(editor)] as Value,
        index: 0,
        newChildren: createFullDocumentTextReplacement(
          editor,
          text,
          replacementMarks
        ) as Value,
        newSelection: explicitAtPreservesNullSelection
          ? null
          : {
              anchor: { path: [0, 0], offset: text.length },
              focus: { path: [0, 0], offset: text.length },
            },
        path: [],
        selection: getPublicSelection(editor),
        type: 'replace_children',
      });
      if (options.at == null) {
        syncImplicitTargetToCurrentSelection(editor);
      }
      return;
    }

    editorWithoutNormalizing(editor, () => {
      const transforms = getEditorTransformRegistry(editor);
      let { at = getDefaultInsertLocation(editor) } = options;
      const insertAt = () => {
        if (LocationApi.isPath(at)) {
          at = editorRange(editor, at);
        }

        if (LocationApi.isRange(at)) {
          if (RangeApi.isCollapsed(at)) {
            at = at.anchor;
          } else {
            const replacementMarks =
              text.length > 0 ? getConsistentRangeTextMarks(editor, at) : null;
            const end = RangeApi.end(at);
            if (!voids && editorVoid(editor, { at: end })) {
              return;
            }
            const start = RangeApi.start(at);
            const startRef = editorPointRef(editor, start);
            const endRef = editorPointRef(editor, end);
            transforms.delete({
              at,
              preserveInlineEdge: true,
              voids,
            } as Parameters<typeof transforms.delete>[0] & {
              preserveInlineEdge: true;
            });
            const selectionAfterDelete = getPublicSelection(editor);
            const selectionPointAfterDelete =
              selectionAfterDelete && RangeApi.isCollapsed(selectionAfterDelete)
                ? {
                    ...selectionAfterDelete.anchor,
                    path: [...selectionAfterDelete.anchor.path],
                  }
                : null;
            const startPoint = startRef.unref();
            const endPoint = endRef.unref();
            const nextAt = selectionPointAfterDelete ?? startPoint ?? endPoint;

            if (!nextAt) {
              return;
            }

            at = nextAt;

            if (options.at == null) {
              transforms.setSelection({ anchor: nextAt, focus: nextAt });
            } else if (explicitAtPreservesNullSelection) {
              transforms.deselect();
            }

            const normalizedReplacementMarks =
              normalizeTextMarks(replacementMarks);

            if (replacementMarks) {
              const textInsertionPoint = getPointTextInsertionPoint(
                editor,
                nextAt,
                normalizedReplacementMarks
              );

              if (textInsertionPoint) {
                if (!explicitAtPreservesNullSelection) {
                  transforms.setSelection({
                    anchor: textInsertionPoint,
                    focus: textInsertionPoint,
                  });
                }
                insertTextAtPoint(editor, textInsertionPoint, text);
                return;
              }

              transforms.insertNodes(
                { text, ...normalizedReplacementMarks },
                {
                  at: nextAt,
                  select: !explicitAtPreservesNullSelection,
                  voids,
                }
              );
              return;
            }
          }
        }

        if (!LocationApi.isPoint(at)) {
          return;
        }

        if (
          (!voids && editorVoid(editor, { at })) ||
          elementReadOnly(editor, { at })
        ) {
          return;
        }

        const { path, offset, root } = at;
        if (text.length > 0) {
          const marks = normalizeTextMarks(
            shouldApplyPendingMarks ? getCurrentMarks(editor) : null
          );

          if (shouldApplyPendingMarks && getCurrentMarks(editor)) {
            const textInsertionPoint = getPointTextInsertionPoint(
              editor,
              at,
              marks
            );

            if (textInsertionPoint) {
              if (!explicitAtPreservesNullSelection) {
                transforms.setSelection({
                  anchor: textInsertionPoint,
                  focus: textInsertionPoint,
                });
              }
              insertTextAtPoint(editor, textInsertionPoint, text);
              setCurrentMarks(editor, null);
              return;
            }

            transforms.insertNodes(
              { text, ...(marks ?? {}) },
              { at, select: !explicitAtPreservesNullSelection, voids }
            );
            setCurrentMarks(editor, null);
            return;
          }

          insertTextAtPoint(editor, { path, offset, root }, text);
        }
      };
      insertAt();
    });
  };

  if (explicitRoot) {
    withEditorOperationRoot(editor, explicitRoot, () =>
      withEditorOperationRootChildren(editor, explicitRoot, insertText)
    );
    return;
  }

  insertText();
};
