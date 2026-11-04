import { jsonEqual } from '../core/change/json';
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
import { isWritablePoint } from '../core/writable-text';
import {
  elementReadOnly,
  refusesReadOnlyWrite,
} from '../editor/element-read-only';
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
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  getChildren as editorGetChildren,
  isInline as editorIsInline,
  isVoid as editorIsVoid,
  range as editorRange,
  void as editorVoid,
} from '../interfaces/editor';
import type {
  TextInsertTextOptions,
  TextMutationMethods,
} from '../interfaces/transforms/text';
import {
  getConsistentRangeTextMarks,
  type TextMarks,
  withoutUnheldDefaultsBeside,
} from '../internal/range-text-marks';
import { getLocationRoot } from '../internal/root-location';
import { insertNodes } from '../transforms-node/insert-nodes';
import { deselect } from '../transforms-selection/deselect';
import { setSelection } from '../transforms-selection/set-selection';
import { getDefaultInsertLocation } from '../utils';
import { removeText } from './delete-text';
import { isFullDocumentRange } from './full-document-range';

/**
 * New text takes the marks of the text it replaces or the marks set for it,
 * without the properties the schema drops on copy, such as review marks.
 */
export const createTypedText = (
  editor: Editor,
  text: string,
  marks: TextMarks | null,
  path: Path,
  root = getEditorUpdateRoot(editor)
) =>
  marks
    ? (getEditorSchema(editor).copyNodeAt(
        { text, ...withoutUnheldDefaultsBeside(editor, marks, path, root) },
        path,
        root
      ) as Text)
    : { text };

/**
 * Text typed into an empty text replaces it, so it keeps that text's own
 * properties under the marks set for it: canonical form leaves an empty text
 * only metadata and site values, which a copy may drop.
 */
const continueEmptyText = (
  editor: Editor,
  typed: Text,
  path: Path,
  root = getEditorUpdateRoot(editor)
): Text => {
  const empty = NodeApi.has(editor, path) ? NodeApi.get(editor, path) : null;

  if (!TextApi.isText(empty) || empty.text !== '') return typed;

  const marks = NodeApi.extractProps(typed);
  const properties = Object.keys(marks).reduce(
    (current, key) =>
      getEditorSchema(editor).canonicalizeTextPropertiesAt(
        current,
        path,
        root,
        key
      ),
    { ...NodeApi.extractProps(empty), ...marks }
  );

  return { ...properties, text: typed.text };
};

const createFullDocumentTextReplacement = (
  editor: Editor,
  text: string,
  marks: TextMarks | null = null
) => {
  const first = editorGetChildren(editor)[0];
  const textNode = createTypedText(
    editor,
    text,
    marks,
    first && 'children' in first ? [0, 0] : [0],
    getEditorUpdateRoot(editor)
  );

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

const startsWithTextBlock = (editor: Editor) => {
  const [first] = editorGetChildren(editor);
  const [child] = NodeApi.isElement(first) ? first.children : [];

  return !NodeApi.isElement(child) || editorIsInline(editor, child);
};

const normalizeTextMarks = (marks: TextMarks | null): TextMarks | null =>
  marks && Object.keys(marks).length > 0 ? marks : null;

const textNodeHasMarks = (node: Text, marks: TextMarks | null) => {
  const expected = marks ?? {};
  const keys = new Set([...Object.keys(node), ...Object.keys(expected)]);

  keys.delete('text');

  return [...keys].every((key) => jsonEqual(node[key], expected[key]));
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

/**
 * Whether the caret sits in a non-empty text that is its parent's only allowed
 * child. A text with the pending marks would need a sibling, which the schema
 * refuses, so typing there joins the caret's text without them. An empty text
 * returns false: the typed text replaces it, so it can carry the marks.
 */
const fillsOneTextParent = (editor: Editor, at: Point) => {
  const node = NodeApi.get(editor, at.path);
  const parent = NodeApi.get(editor, PathApi.parent(at.path));

  return (
    TextApi.isText(node) &&
    node.text !== '' &&
    NodeApi.isElement(parent) &&
    typeof parent.type === 'string' &&
    getEditorSchema(editor).getElementContent(parent.type)?.max === 1
  );
};

const getNextTextInBlock = (editor: Editor, path: Path) => {
  let blockPath = PathApi.parent(path);

  while (editorIsInline(editor, NodeApi.get(editor, blockPath))) {
    blockPath = PathApi.parent(blockPath);
  }

  const from = path.slice(blockPath.length);

  for (const [text, textPath] of NodeApi.texts(NodeApi.get(editor, blockPath), {
    from,
    pass: ([node]) => NodeApi.isElement(node) && editorIsVoid(editor, node),
  })) {
    if (!PathApi.equals(textPath, from)) return text;
  }

  return null;
};

const getMarksAtNonInclusiveEnd = (
  editor: Editor,
  at: Point
): TextMarks | null => {
  const node = NodeApi.has(editor, at.path)
    ? NodeApi.get(editor, at.path)
    : null;
  const atNonEmptyTextEnd =
    TextApi.isText(node) && node.text !== '' && at.offset === node.text.length;

  if (!atNonEmptyTextEnd) return null;

  const editorSchema = getEditorSchema(editor);
  const parent = NodeApi.get(editor, PathApi.parent(at.path));
  const parentIsFull =
    NodeApi.isElement(parent) &&
    typeof parent.type === 'string' &&
    (editorSchema.getElementContent(parent.type)?.max ?? Infinity) <=
      parent.children.length;

  if (parentIsFull) return null;

  const root = at.root ?? getEditorUpdateRoot(editor);
  const next = getNextTextInBlock(editor, at.path);
  const typingKeeps = (key: string) => {
    const property = editorSchema.getTextPropertyAt(key, at.path, root);

    return (
      property?.lifecycle.inclusive !== false ||
      property.role === 'metadata' ||
      property.descriptor.required ||
      (TextApi.isText(next) && jsonEqual(next[key], node[key]))
    );
  };
  const properties = NodeApi.extractProps(node);
  const marks = Object.fromEntries(
    Object.entries(properties).filter(([key]) => typingKeeps(key))
  );

  return Object.keys(marks).length < Object.keys(properties).length
    ? marks
    : null;
};

const insertTextAtPoint = (editor: Editor, at: Point, text: string) => {
  if (text.length === 0) return;

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
      (LocationApi.isPoint(preflightAt) &&
        !voids &&
        editorVoid(editor, { at: preflightAt })) ||
      refusesReadOnlyWrite(editor, preflightAt)
    ) {
      return;
    }

    const documentRange =
      text.length > 0 &&
      LocationApi.isRange(preflightAt) &&
      isFullDocumentRange(editor, preflightAt)
        ? preflightAt
        : null;
    const writesFirstBlock = !!documentRange && startsWithTextBlock(editor);

    if (
      documentRange &&
      !isWritablePoint(editor, RangeApi.start(documentRange), {
        voids: voids && writesFirstBlock,
      })
    ) {
      return;
    }

    if (documentRange && writesFirstBlock) {
      const replacementMarks = getConsistentRangeTextMarks(
        editor,
        documentRange
      );

      const root = getEditorUpdateRoot(editor);
      const newSelection = explicitAtPreservesNullSelection
        ? null
        : SelectionApi.text({
            anchor: { path: [0, 0], offset: text.length },
            focus: { path: [0, 0], offset: text.length },
          });

      applyBuiltDocumentChange(
        editor,
        (builder) => {
          const since = builder.draftSteps.length;
          const step = builder.replaceChildren(
            root,
            [],
            0,
            editorGetChildren(editor).length,
            createFullDocumentTextReplacement(
              editor,
              text,
              replacementMarks
            ) as Value
          );

          if (builder.marksLetters) {
            builder.markLetters(since, root, 0, builder.getIndex(root).length);
          }
          return step;
        },
        { selection: { root, value: newSelection } }
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
          const removal = removeText(editor, {
            at,
            preserveInlineEdge: true,
            voids,
            writes: true,
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

          if (!removal) return;

          const nextAt =
            removal.kind === 'grid'
              ? removal.landing
              : options.at == null
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
              createTypedText(
                editor,
                text,
                normalizedReplacementMarks,
                nextAt.path,
                nextAt.root
              ),
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
        const typedMarks = shouldApplyPendingMarks
          ? (getCurrentMarks(editor) ?? getMarksAtNonInclusiveEnd(editor, at))
          : null;
        const marks = normalizeTextMarks(typedMarks);

        if (typedMarks) {
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

          if (fillsOneTextParent(editor, at)) {
            insertTextAtPoint(editor, { path, offset, root }, text);
          } else {
            insertNodes(
              editor as Editor,
              continueEmptyText(
                editor,
                createTypedText(editor, text, marks, path, root),
                path,
                root
              ),
              { at, select: !explicitAtPreservesNullSelection, voids }
            );
          }
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
