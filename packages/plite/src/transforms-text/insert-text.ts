import { getEditorSchema } from '../core/editor-runtime';
import {
  applyBuiltDocumentChange,
  getCurrentMarks,
  getEditorUpdateRoot,
  getPublicSelection,
  getSelectionMarks,
  setCurrentMarks,
  syncImplicitTargetToCurrentSelection,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
} from '../core/public-state';
import { elementReadOnly } from '../editor/element-read-only';
import {
  LocationApi,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  RangeApi,
  SelectionApi,
  type Text,
  TextApi,
  type Value,
} from '../interfaces';
import {
  getChildren as editorGetChildren,
  range as editorRange,
  void as editorVoid,
} from '../interfaces/editor';
import type { AnyEditor as Editor } from '../interfaces/editor';
import type {
  TextInsertTextOptions,
  TextMutationMethods,
} from '../interfaces/transforms/text';
import {
  getConsistentRangeTextMarks,
  type TextMarks,
} from '../internal/range-text-marks';
import { getLocationRoot } from '../internal/root-location';
import { insertNodes } from '../transforms-node/insert-nodes';
import { deselect } from '../transforms-selection/deselect';
import { setSelection } from '../transforms-selection/set-selection';
import { getDefaultInsertLocation } from '../utils';
import { deleteText } from './delete-text';
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

const textNodeHasMarks = (
  editor: Editor,
  node: Text,
  marks: TextMarks | null,
  path: Path,
  root: string
) => {
  const expected = marks ?? {};
  const keys = new Set([...Object.keys(node), ...Object.keys(expected)]);

  keys.delete('text');

  return [...keys].every((key) =>
    getEditorSchema(editor).isTextPropertyEqualAt(
      key,
      node[key],
      expected[key],
      path,
      root
    )
  );
};

const getPointTextInsertionPoint = (
  editor: Editor,
  at: Point,
  marks: TextMarks | null
): Point | null => {
  if (!NodeApi.has(editor, at.path)) {
    return null;
  }

  const node = NodeApi.get(editor, at.path);
  const root = at.root ?? getEditorUpdateRoot(editor);

  if (!TextApi.isText(node)) {
    return null;
  }

  if (textNodeHasMarks(editor, node, marks, at.path, root)) {
    return at;
  }

  if (at.offset === node.text.length) {
    const nextPath = PathApi.next(at.path);
    const next = NodeApi.has(editor, nextPath)
      ? NodeApi.get(editor, nextPath)
      : null;

    if (
      TextApi.isText(next) &&
      textNodeHasMarks(editor, next, marks, nextPath, root)
    ) {
      return { ...at, offset: 0, path: nextPath };
    }
  }

  if (at.offset === 0 && PathApi.hasPrevious(at.path)) {
    const previousPath = PathApi.previous(at.path);
    const previous = NodeApi.has(editor, previousPath)
      ? NodeApi.get(editor, previousPath)
      : null;

    if (
      TextApi.isText(previous) &&
      textNodeHasMarks(editor, previous, marks, previousPath, root)
    ) {
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
  applyBuiltDocumentChange(
    editor,
    (builder, root) =>
      builder.insertText(at.root ?? root, at.path, at.offset, text),
    { selectionAssociation: 'forward' }
  );
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

      const root = getEditorUpdateRoot(editor);
      const newSelection = explicitAtPreservesNullSelection
        ? null
        : SelectionApi.text({
            anchor: { path: [0, 0], offset: text.length },
            focus: { path: [0, 0], offset: text.length },
          });

      applyBuiltDocumentChange(
        editor,
        (builder) =>
          builder.replaceChildren(
            root,
            [],
            0,
            editorGetChildren(editor).length,
            createFullDocumentTextReplacement(
              editor,
              text,
              replacementMarks
            ) as Value
          ),
        { selectionAfter: newSelection, selectionRoot: root }
      );
      if (options.at == null) {
        syncImplicitTargetToCurrentSelection(editor);
      }
      return;
    }

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
          const startAnchor = editor.anchor(start, {
            association: 'backward',
            deletion: 'nearest',
          });
          const endAnchor = editor.anchor(end, {
            association: 'forward',
            deletion: 'nearest',
          });
          deleteText(editor, {
            at,
            preserveInlineEdge: true,
            voids,
          } as Parameters<typeof deleteText>[1] & {
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
          const startPoint = startAnchor.release();
          const endPoint = endAnchor.release();
          const nextAt =
            options.at == null
              ? (selectionPointAfterDelete ?? startPoint ?? endPoint)
              : (startPoint ?? endPoint);

          if (!nextAt) {
            return;
          }

          at = nextAt;

          if (options.at == null) {
            setSelection(editor, { anchor: nextAt, focus: nextAt });
          } else if (explicitAtPreservesNullSelection) {
            deselect(editor);
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
                setSelection(editor, {
                  anchor: textInsertionPoint,
                  focus: textInsertionPoint,
                });
              }
              insertTextAtPoint(editor, textInsertionPoint, text);
              return;
            }

            insertNodes(
              editor as Editor,
              { text, ...normalizedReplacementMarks },
              {
                at: nextAt,
                select: !explicitAtPreservesNullSelection,
                voids,
              }
            );
            return;
          }

          setCurrentMarks(editor, null);

          const inheritedMarks = normalizeTextMarks(getSelectionMarks(editor));
          const inheritedInsertionPoint = getPointTextInsertionPoint(
            editor,
            nextAt,
            inheritedMarks
          );

          if (inheritedInsertionPoint) {
            if (!explicitAtPreservesNullSelection) {
              setSelection(editor, {
                anchor: inheritedInsertionPoint,
                focus: inheritedInsertionPoint,
              });
            }
            insertTextAtPoint(editor, inheritedInsertionPoint, text);
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
              setSelection(editor, {
                anchor: textInsertionPoint,
                focus: textInsertionPoint,
              });
            }
            insertTextAtPoint(editor, textInsertionPoint, text);
            setCurrentMarks(editor, null);
            return;
          }

          insertNodes(
            editor as Editor,
            { text, ...marks },
            { at, select: !explicitAtPreservesNullSelection, voids }
          );
          setCurrentMarks(editor, null);
          return;
        }

        insertTextAtPoint(editor, { path, offset, root }, text);

        if (
          options.at == null &&
          options.marks === false &&
          getCurrentMarks(editor)
        ) {
          setCurrentMarks(editor, null);
        }
      }
    };
    insertAt();
  };

  if (explicitRoot) {
    withEditorUpdateRoot(editor, explicitRoot, () => {
      withEditorUpdateRootChildren(editor, explicitRoot, insertText);
    });
    return;
  }

  insertText();
};
