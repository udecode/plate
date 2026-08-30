import { dispatchCommand } from '../core/command-registry';
import { type DeleteCommand, editorCommands } from '../core/editor-commands';
import {
  runEditorTransaction,
  withEditorUpdateRootScope,
} from '../core/public-state';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { removeNodes } from '../transforms-node/remove-nodes';
import { deleteText } from '../transforms-text/delete-text';
import type { TextUnit } from '../types/types';
import type { WithEditorFirstArg } from '../utils/types';
import { point } from './point';

export const applyDelete = (editor: Editor, command: DeleteCommand) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (SelectionApi.isNode(selection)) {
      const root = selection.root ?? editor.read.view.root() ?? 'main';

      withEditorUpdateRootScope(editor, root, () => {
        const { paths } = selection;
        const firstPath = paths[0];
        const lastPath = paths.at(-1);

        if (!firstPath || !lastPath) return;

        const previousPath = PathApi.hasPrevious(firstPath)
          ? PathApi.previous(firstPath)
          : null;
        const nextPath = PathApi.next(lastPath);
        const previousPoint = previousPath
          ? point(editor, previousPath, { edge: 'end' })
          : null;
        const nextPoint = editor.read.nodes.get(nextPath)
          ? point(editor, nextPath, { edge: 'start' })
          : null;
        const previousAnchor = previousPoint
          ? editor.anchor(previousPoint, {
              association: 'backward',
              deletion: 'nearest',
            })
          : null;
        const nextAnchor = nextPoint
          ? editor.anchor(nextPoint, {
              association: 'forward',
              deletion: 'nearest',
            })
          : null;

        for (const path of paths.toReversed()) {
          removeNodes(editor, { at: path });
        }

        const candidates =
          command.direction === 'backward'
            ? [previousAnchor, nextAnchor]
            : [nextAnchor, previousAnchor];
        let fallbackPoint = null;

        for (const candidate of candidates) {
          if (!candidate) continue;

          fallbackPoint = candidate.release();
          if (fallbackPoint) break;
        }

        previousAnchor?.release();
        nextAnchor?.release();
        const rootedFallbackPoint =
          fallbackPoint && root !== 'main'
            ? { ...fallbackPoint, root }
            : fallbackPoint;

        tx.setSelection(
          rootedFallbackPoint
            ? SelectionApi.text({
                anchor: rootedFallbackPoint,
                focus: rootedFallbackPoint,
              })
            : null
        );
      });
      return;
    }

    if (
      selection &&
      RangeApi.isRange(selection) &&
      RangeApi.isCollapsed(selection)
    ) {
      deleteText(editor, {
        unit: command.unit,
        reverse: command.direction === 'backward',
      });
    }
  });
};

export const deleteBackward: WithEditorFirstArg<(unit: TextUnit) => void> = (
  editor,
  unit
) => {
  dispatchCommand(editor, editorCommands.delete, {
    direction: 'backward',
    unit,
  });
};
