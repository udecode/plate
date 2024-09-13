import { type Location, Editor } from 'slate';

import type { NodeEntryOf } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

/** Get the last node at a location. */
export const getLastNode = <E extends TEditor>(
  editor: E,
  at: Location
): NodeEntryOf<E> => Editor.last(editor as any, at) as any;
