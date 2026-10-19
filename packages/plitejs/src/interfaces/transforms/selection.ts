import type {
  Editor,
  EditorSelection,
  Location,
  Point,
  Range,
  Value,
} from '../../index';
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
  collapse: <V extends Value, TPlugins extends readonly unknown[]>(
    editor: Editor<V, TPlugins>,
    options?: SelectionCollapseOptions
  ) => void;

  /**
   * Unset the selection.
   */
  deselect: <V extends Value, TPlugins extends readonly unknown[]>(
    editor: Editor<V, TPlugins>
  ) => void;

  /**
   * Move the selection's point forward or backward.
   */
  move: <V extends Value, TPlugins extends readonly unknown[]>(
    editor: Editor<V, TPlugins>,
    options?: SelectionMoveOptions
  ) => void;

  /**
   * Set the selection to a new value.
   */
  select: <V extends Value, TPlugins extends readonly unknown[]>(
    editor: Editor<V, TPlugins>,
    target: EditorSelection | Location
  ) => void;

  /**
   * Set new properties on one of the selection's points.
   */
  setPoint: <V extends Value, TPlugins extends readonly unknown[]>(
    editor: Editor<V, TPlugins>,
    props: Partial<Point>,
    options?: SelectionSetPointOptions
  ) => void;

  /**
   * Set new properties on the selection.
   */
  setSelection: <V extends Value, TPlugins extends readonly unknown[]>(
    editor: Editor<V, TPlugins>,
    props: Partial<Range>
  ) => void;
}
