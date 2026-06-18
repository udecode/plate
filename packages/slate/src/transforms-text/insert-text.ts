import {
  applyOperation,
  getPublicSelection,
  syncImplicitTargetToCurrentSelection,
  withEditorOperationRoot,
  withEditorOperationRootChildren,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { elementReadOnly } from '../editor/element-read-only';
import { LocationApi, RangeApi, type Value } from '../interfaces';
import { Editor } from '../interfaces/editor';
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
  const first = Editor.getChildren(editor)[0];
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

export const applyInsertText: TextMutationMethods['insertText'] = (
  editor,
  text,
  options: TextInsertTextOptions = {}
) => {
  const explicitRoot = getLocationRoot(options.at);
  const insertText = () => {
    const { voids = false } = options;
    const explicitAtPreservesNullSelection =
      options.at != null && getPublicSelection(editor) == null;
    const defaultAt = options.at ?? getDefaultInsertLocation(editor);
    const preflightAt = (() => {
      if (LocationApi.isPath(defaultAt)) {
        return Editor.range(editor, defaultAt);
      }

      if (LocationApi.isRange(defaultAt) && RangeApi.isCollapsed(defaultAt)) {
        return defaultAt.anchor;
      }

      return defaultAt;
    })();

    if (
      LocationApi.isPoint(preflightAt) &&
      ((!voids && Editor.void(editor, { at: preflightAt })) ||
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
        children: [...Editor.getChildren(editor)] as Value,
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

    Editor.withoutNormalizing(editor, () => {
      const transforms = getEditorTransformRegistry(editor);
      let { at = getDefaultInsertLocation(editor) } = options;
      const insertAt = () => {
        if (LocationApi.isPath(at)) {
          at = Editor.range(editor, at);
        }

        if (LocationApi.isRange(at)) {
          if (RangeApi.isCollapsed(at)) {
            at = at.anchor;
          } else {
            const replacementMarks =
              text.length > 0 ? getConsistentRangeTextMarks(editor, at) : null;
            const end = RangeApi.end(at);
            if (!voids && Editor.void(editor, { at: end })) {
              return;
            }
            const start = RangeApi.start(at);
            const startRef = Editor.pointRef(editor, start);
            const endRef = Editor.pointRef(editor, end);
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

            if (replacementMarks) {
              transforms.insertNodes(
                { text, ...replacementMarks },
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
          (!voids && Editor.void(editor, { at })) ||
          elementReadOnly(editor, { at })
        ) {
          return;
        }

        const { path, offset, root } = at;
        if (text.length > 0) {
          applyOperation(editor, {
            type: 'insert_text',
            path,
            offset,
            root,
            text,
          });
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
