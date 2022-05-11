import { Point, Transforms } from 'slate';
import { TEditor, Value } from '../editor/TEditor';

/**
 * Set new properties on one of the selection's points.
 */
export const setPoint = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<Point>,
  options?: Parameters<typeof Transforms.setPoint>[2]
) => {
  Transforms.setPoint(editor as any, props, options);
};
