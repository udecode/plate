import { Location, Transforms } from 'slate';
import { TEditor, Value } from '../types/TEditor';

/**
 * Set the selection to a new value.
 */
export const select = <V extends Value>(
  editor: TEditor<V>,
  target: Location
) => {
  Transforms.select(editor as any, target);
};
