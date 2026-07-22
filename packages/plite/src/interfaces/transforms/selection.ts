import type { Editor, Location, Point, Range, Value } from '../../index';
import type { MoveUnit, SelectionEdge } from '../../types/types';

export interface SelectionCollapseOptions {
  edge?: SelectionEdge;
}

export interface SelectionMoveOptions {
  distance?: number;
  unit?: MoveUnit;
  reverse?: boolean;
  edge?: SelectionEdge;
}

export interface SelectionSetPointOptions {
  edge?: SelectionEdge;
}

export interface SelectionMutationMethods {
  /**
   * Collapse the selection.
   */
  collapse: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>,
    options?: SelectionCollapseOptions
  ) => void;

  /**
   * Unset the selection.
   */
  deselect: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>
  ) => void;

  /**
   * Move the selection's point forward or backward.
   */
  move: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>,
    options?: SelectionMoveOptions
  ) => void;

  /**
   * Set the selection to a new value.
   */
  select: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>,
    target: Location
  ) => void;

  /**
   * Set new properties on one of the selection's points.
   */
  setPoint: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>,
    props: Partial<Point>,
    options?: SelectionSetPointOptions
  ) => void;

  /**
   * Set new properties on the selection.
   */
  setSelection: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: Editor<V, TExtensions>,
    props: Partial<Range>
  ) => void;
}
