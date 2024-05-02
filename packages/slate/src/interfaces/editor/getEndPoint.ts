import { Editor, type Location } from 'slate';

import type { TEditor, Value } from './TEditor';

/** Get the end point of a location. */
export const getEndPoint = <V extends Value>(
  editor: TEditor<V>,
  at: Location
) => Editor.end(editor as any, at);
