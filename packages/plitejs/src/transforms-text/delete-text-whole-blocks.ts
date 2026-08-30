import { getEditorSchema } from '../core/editor-runtime';
import {
  applyBuiltDocumentChange,
  getEditorUpdateRoot,
  profileCoreDuration,
} from '../core/public-state';
import { NodeApi, PointApi, SelectionApi } from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
  point as editorPoint,
} from '../interfaces/editor';
import type { DeleteRangePlan } from './delete-text-plan';

type WholeTopLevelBlockRange = {
  deletesWholeDocument: boolean;
  endIndex: number;
  startIndex: number;
};

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
  const deletesWholeDocument =
    startIndex === 0 && endIndex === editorChildren.length - 1;

  if (startIndex == null || endIndex == null) {
    return null;
  }

  const coversWholeEdgeRange = profileCoreDuration(
    'delete-whole-range-edge-check',
    () =>
      PointApi.equals(
        plan.start,
        editorPoint(editor, [startIndex], { edge: 'start' })
      ) &&
      PointApi.equals(
        plan.end,
        editorPoint(editor, [endIndex], { edge: 'end' })
      )
  );

  if (!coversWholeEdgeRange) {
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

  return { deletesWholeDocument, endIndex, startIndex };
};

export const deleteWholeTopLevelBlockRange = (
  editor: Editor,
  range: WholeTopLevelBlockRange
) => {
  const children = editorGetChildren(editor);
  const startBlock = children[range.startIndex];

  if (range.deletesWholeDocument) {
    if (
      !NodeApi.isElement(startBlock) ||
      getEditorSchema(editor).isVoid(startBlock) ||
      !startBlock.children.every(
        (child) =>
          NodeApi.isText(child) ||
          (NodeApi.isElement(child) && getEditorSchema(editor).isInline(child))
      )
    ) {
      return false;
    }

    const removedChildren = profileCoreDuration(
      'delete-whole-range-children-slice',
      () => children.slice()
    );

    profileCoreDuration('delete-whole-range-apply', () => {
      const root = getEditorUpdateRoot(editor);
      const selection = SelectionApi.text({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      applyBuiltDocumentChange(
        editor,
        (builder) =>
          builder.replaceChildren(root, [], 0, removedChildren.length, [
            {
              ...startBlock,
              children: [{ text: '' }],
            },
          ]),
        {
          selectionAfter: selection,
          selectionRoot: root,
        }
      );
    });
    return true;
  }

  const preferNext = range.endIndex + 1 < children.length;
  const selectionPath = preferNext
    ? [range.endIndex + 1]
    : [range.startIndex - 1];
  const selectionPoint = editorPoint(editor, selectionPath, {
    edge: preferNext ? 'start' : 'end',
  });
  const newSelectionPoint = {
    ...selectionPoint,
    path: preferNext
      ? [range.startIndex, ...selectionPoint.path.slice(1)]
      : selectionPoint.path,
  };

  const removedChildren = profileCoreDuration(
    'delete-whole-range-children-slice',
    () => children.slice(range.startIndex, range.endIndex + 1)
  );

  profileCoreDuration('delete-whole-range-apply', () => {
    const root = getEditorUpdateRoot(editor);
    const selection = SelectionApi.text({
      anchor: newSelectionPoint,
      focus: newSelectionPoint,
    });

    applyBuiltDocumentChange(
      editor,
      (builder) =>
        builder.replaceChildren(
          root,
          [],
          range.startIndex,
          removedChildren.length,
          []
        ),
      {
        selectionAfter: selection,
        selectionRoot: root,
      }
    );
  });
  return true;
};
