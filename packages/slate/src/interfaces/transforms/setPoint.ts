import { Point, Transforms } from 'slate';
import { SelectionSetPointOptions } from 'slate/dist/transforms/selection';
import { TEditor, Value } from '../editor/TEditor';

/**
 * Set new properties on one of the selection's points.
 */
export const setPoint = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<Point>,
  options?: SelectionSetPointOptions
) => {
  Transforms.setPoint(editor as any, props, options);
};
