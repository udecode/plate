import {
  getCurrentSelection,
  getCurrentSelectionRoot,
  getEditorUpdateRoot,
} from '../core/public-state';
import { type Location, LocationApi, SelectionApi } from '../interfaces';
import { range as editorRange } from '../interfaces/editor';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';
import {
  getPointRoot,
  getRangeRoot,
  type RangeRootMeta,
  stripImplicitRangeRoots,
} from '../internal/root-location';
import { formatDebugValue } from '../utils/format-debug-value';
import { writeSelection, setSelection } from './set-selection';

const getCommandRangeRootMeta = (
  target: Location,
  fallback: string
): RangeRootMeta => {
  if (LocationApi.isRange(target)) {
    return getRangeRoot(target, fallback);
  }

  if (LocationApi.isPoint(target)) {
    const point = getPointRoot(target, fallback);

    return {
      anchor: point,
      focus: point,
      root: point.root,
    };
  }

  const point = {
    root: fallback,
    visibility: 'implicit',
  } as const;

  return {
    anchor: point,
    focus: point,
    root: fallback,
  };
};

export const select: SelectionMutationMethods['select'] = (editor, target) => {
  const selection = getCurrentSelection(editor);
  const commandRangeRootMeta = getCommandRangeRootMeta(
    target,
    getEditorUpdateRoot(editor) ?? getCurrentSelectionRoot(editor)
  );

  if (commandRangeRootMeta.root === null) {
    throw new Error('An editor selection range cannot cross document roots.');
  }

  const range = editorRange(editor, target);
  const commandRange = stripImplicitRangeRoots(range, commandRangeRootMeta);

  if (SelectionApi.isSelection(target)) {
    writeSelection(
      editor,
      {
        ...target,
        ...commandRange,
      },
      commandRangeRootMeta.root
    );
    return;
  }

  if (!LocationApi.isRange(commandRange)) {
    throw new Error(
      `When setting the selection you must provide at least an \`anchor\` and \`focus\`, but you passed: ${formatDebugValue(
        commandRange
      )}`
    );
  }

  if (selection && SelectionApi.isText(selection)) {
    setSelection(editor, commandRange);
    return;
  }

  writeSelection(
    editor,
    SelectionApi.text(commandRange),
    commandRangeRootMeta.root
  );
};
