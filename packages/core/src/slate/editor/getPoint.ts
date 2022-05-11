import { Editor, Location } from 'slate';
import { TEditor, Value } from './TEditor';

export type GetPointOptions = Parameters<typeof Editor.point>[2];

/**
 * Get the start or end point of a location.
 */
export const getPoint = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetPointOptions
) => Editor.point(editor as any, at, options);
