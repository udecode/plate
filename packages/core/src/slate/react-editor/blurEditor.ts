import { ReactEditor } from 'slate-react';
import { Value } from '../types/TEditor';
import { TReactEditor } from '../types/TReactEditor';

/**
 * Blur the editor.
 */
export const blurEditor = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.blur(editor as any);
