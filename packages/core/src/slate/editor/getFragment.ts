import { Editor, Location } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { EElement } from '../types/TElement';
import { EText } from '../types/TText';

/**
 * Get the fragment at a location.
 */
export const getFragment = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): Array<EElement<V> | EText<V>> => Editor.fragment(editor as any, at) as any;
