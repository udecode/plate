import { Editor, type Location } from 'slate';

import type { ElementOrTextOf } from '../element/TElement';
import type { TEditor } from './TEditor';

/** Get the fragment at a location. */
export const getFragment = <E extends TEditor>(
  editor: E,
  at: Location
): ElementOrTextOf<E>[] => Editor.fragment(editor as any, at) as any;
