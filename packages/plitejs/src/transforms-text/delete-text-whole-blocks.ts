import { getEditorSchema } from '../core/editor-runtime';
import {
  applyBuiltDocumentChange,
  getEditorUpdateRoot,
  profileCoreDuration,
} from '../core/public-state';
import { canReplaceChildrenWithText } from '../core/writable-text';
import { isStructuralEdge, readTextEdge } from '../editor/point';
import { NodeApi, type Point, SelectionApi } from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
} from '../interfaces/editor';
import { readSharedGridCell } from './delete-text-grid';
import type { DeleteRangePlan } from './delete-text-plan';

export type WholeTopLevelBlockRange = Readonly<{
  endIndex: number;
  landing: Point;
  startIndex: number;
}>;

export const getWholeTopLevelBlockRange = (
  editor: Editor,
  plan: DeleteRangePlan
): WholeTopLevelBlockRange | null => {
  if (
    plan.isCollapsed ||
    plan.startNonEditable ||
    plan.endNonEditable ||
    plan.preserveEmptyStartBlockPath ||
    !plan.isAcrossBlocks
  ) {
    return null;
  }

  const startIndex = plan.start.path[0];
  const endIndex = plan.end.path[0];
  const editorChildren = editorGetChildren(editor);

  if (startIndex == null || endIndex == null) {
    return null;
  }

  const coversWholeEdgeRange = profileCoreDuration(
    'delete-whole-range-edge-check',
    () =>
      isStructuralEdge(
        NodeApi.get(editor, [startIndex]),
        [startIndex],
        plan.start,
        'start'
      ) &&
      isStructuralEdge(
        NodeApi.get(editor, [endIndex]),
        [endIndex],
        plan.end,
        'end'
      )
  );

  if (
    !coversWholeEdgeRange ||
    readSharedGridCell(editor, plan.effectiveRange)
  ) {
    return null;
  }

  const containsOnlyBlocks = profileCoreDuration(
    'delete-whole-range-block-scan',
    () => {
      for (let index = startIndex; index <= endIndex; index += 1) {
        const node = editorChildren[index];

        if (!NodeApi.isElement(node) || !editorIsBlock(editor, node)) {
          return false;
        }
      }

      return true;
    }
  );

  if (!containsOnlyBlocks) {
    return null;
  }

  if (startIndex === 0 && endIndex === editorChildren.length - 1) {
    return canReplaceChildrenWithText(
      getEditorSchema(editor),
      editorChildren[startIndex]
    )
      ? { endIndex, landing: { offset: 0, path: [0, 0] }, startIndex }
      : null;
  }

  const landing =
    (endIndex + 1 < editorChildren.length
      ? readTextEdge(editor, [endIndex + 1], 'start')
      : null) ??
    (startIndex > 0 ? readTextEdge(editor, [startIndex - 1], 'end') : null);

  return landing ? { endIndex, landing, startIndex } : null;
};

export const deleteWholeTopLevelBlockRange = (
  editor: Editor,
  range: WholeTopLevelBlockRange
): Point => {
  const { endIndex, landing, startIndex } = range;
  const children = editorGetChildren(editor);
  const startBlock = children[startIndex];
  const removedChildren = profileCoreDuration(
    'delete-whole-range-children-slice',
    () => children.slice(startIndex, endIndex + 1)
  );
  const wholeDocument = removedChildren.length === children.length;
  const caret =
    landing.path[0] > endIndex
      ? {
          ...landing,
          path: [
            landing.path[0] - removedChildren.length,
            ...landing.path.slice(1),
          ],
        }
      : landing;

  profileCoreDuration('delete-whole-range-apply', () => {
    const root = getEditorUpdateRoot(editor);

    applyBuiltDocumentChange(
      editor,
      (builder) =>
        builder.replaceChildren(
          root,
          [],
          startIndex,
          removedChildren.length,
          wholeDocument ? [{ ...startBlock, children: [{ text: '' }] }] : []
        ),
      {
        selection: {
          root,
          value: SelectionApi.text({ anchor: caret, focus: caret }),
        },
      }
    );
  });

  return caret;
};
