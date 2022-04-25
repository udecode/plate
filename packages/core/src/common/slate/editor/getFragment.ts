import { Editor, Location } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { ElementOf } from '../../../types/slate/TElement';
import { TextOf } from '../../../types/slate/TText';

/**
 * Get the fragment at a location.
 */
export const getFragment = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): Array<ElementOf<TEditor<V>> | TextOf<TEditor<V>>> =>
  Editor.fragment(editor as any, at) as any;
