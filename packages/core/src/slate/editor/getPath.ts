import { Editor, Location } from 'slate';
import { TEditor, Value } from './TEditor';

export type GetPathOptions = Parameters<typeof Editor.path>[2];

/**
 * Get the path of a location.
 */
export const getPath = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetPathOptions
) => Editor.path(editor as any, at, options as any);
