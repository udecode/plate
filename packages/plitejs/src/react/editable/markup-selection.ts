import { type Point, PointApi, RangeApi, SelectionApi } from '../..';
import type { AnyEditor } from '../../interfaces/editor';
import {
  isPliteViewSelectionCollapsed,
  type PliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import { writeRuntimeSelection } from './runtime-mutation-state';
import { readRuntimeSelection } from './runtime-selection-state';

/**
 * A collapsed caret outside struck text is the model selection, with its
 * affinity naming the side of a struck run docked at its point. Only a
 * selection the model cannot express stays a projected view selection.
 */
export const writeMarkupSelection = (
  editor: AnyEditor,
  selection: PliteViewSelection | null
) => {
  if (!selection || !isModelCaret(selection)) {
    writePliteViewSelection(editor, selection);
    return;
  }
  writeModelCaret(editor, selection.anchor.point, selection.anchor.affinity);
};

export const isModelCaret = (selection: PliteViewSelection) =>
  isPliteViewSelectionCollapsed(selection) &&
  !selection.anchor.fragmentId &&
  !selection.anchor.owner;

export const writeModelCaret = (
  editor: AnyEditor,
  point: Point,
  affinity?: 'backward' | 'forward'
) => {
  writePliteViewSelection(editor, null);
  const current = readRuntimeSelection(editor);
  if (
    SelectionApi.isText(current) &&
    RangeApi.isCollapsed(current) &&
    PointApi.equals(current.anchor, point) &&
    current.affinity === affinity
  ) {
    return;
  }
  writeRuntimeSelection(
    editor,
    SelectionApi.text(
      { anchor: point, focus: point },
      affinity ? { affinity } : undefined
    )
  );
};
