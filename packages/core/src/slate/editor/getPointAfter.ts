import { Editor, Location } from 'slate';
import { TEditor, Value } from './TEditor';

export type GetPointAfterOptions = Parameters<typeof Editor.after>[2];

/**
 * Get the point after a location.
 */
export const getPointAfter = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetPointAfterOptions
) => Editor.after(editor as any, at, options);
