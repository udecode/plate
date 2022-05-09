import { Editor, Location } from 'slate';
import { TEditor, Value } from './TEditor';

export type GetPointBeforeOptions = Parameters<typeof Editor.before>[2];

/**
 * Get the point before a location.
 */
export const getPointBefore = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetPointBeforeOptions
) => Editor.before(editor as any, at, options);
