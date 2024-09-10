import { Editor, type Location } from 'slate';

import type { NodeEntryOf } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

/** Get the first node at a location. */
export const getFirstNode = <E extends TEditor>(
  editor: E,
  at: Location
): NodeEntryOf<E> => Editor.first(editor as any, at) as any;
