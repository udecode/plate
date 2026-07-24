import { dispatchCommand } from '../core/command-registry';
import { type DeleteCommand, editorCommands } from '../core/editor-commands';
import {
  runEditorTransaction,
  withEditorUpdateRootScope,
} from '../core/public-state';
import { hasPath } from './has-path';
import { point } from './point';
import type { Editor } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { removeNodes } from '../transforms-node/remove-nodes';
import { deleteText } from '../transforms-text/delete-text';
import type { TextUnit } from '../types/types';
import type { WithEditorFirstArg } from '../utils/types';

export const applyDelete = (editor: Editor, command: DeleteCommand) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (SelectionApi.isNode(selection)) {
      const root =
        selection.anchor.root ??
        selection.focus.root ??
        editor.read.view.root() ??
        'main';

      withEditorUpdateRootScope(editor, root, () => {
        const { path } = selection;
        const previousPath = PathApi.hasPrevious(path)
          ? PathApi.previous(path)
          : null;
        const nextPath = PathApi.next(path);
        const hadPrevious = previousPath
          ? hasPath(editor, previousPath)
          : false;
        const hadNext = hasPath(editor, nextPath);

        removeNodes(editor, { at: path });

        const candidates =
          command.direction === 'backward'
            ? [
                hadPrevious && previousPath
                  ? { edge: 'end' as const, path: previousPath }
                  : null,
                hadNext ? { edge: 'start' as const, path } : null,
              ]
            : [
                hadNext ? { edge: 'start' as const, path } : null,
                hadPrevious && previousPath
                  ? { edge: 'end' as const, path: previousPath }
                  : null,
              ];
        const fallback = candidates.find(
          (candidate) => candidate && hasPath(editor, candidate.path)
        );
        const fallbackPoint = fallback
          ? point(editor, fallback.path, { edge: fallback.edge })
          : null;
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
