import { ReactEditor } from 'slate-react';
import { Value } from '../editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Blur the editor.
 */
export const blurEditor = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.blur(editor as any);
