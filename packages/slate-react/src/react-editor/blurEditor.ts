import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';

import { TReactEditor } from '../types/TReactEditor';

/**
 * Blur the editor.
 */
export const blurEditor = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.blur(editor as any);
