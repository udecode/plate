import { Editor, type Location } from 'slate';

import type { EElementOrText } from '../element/TElement';
import type { TEditor, Value } from './TEditor';

/** Get the fragment at a location. */
export const getFragment = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): EElementOrText<V>[] => Editor.fragment(editor as any, at) as any;
