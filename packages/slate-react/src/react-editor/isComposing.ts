import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';

import { TReactEditor } from '../types/TReactEditor';

/**
 * Check if the user is currently composing inside the editor.
 */
export const isComposing = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.isComposing(editor as any);
