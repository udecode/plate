import type { Value } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Deselect the editor. */
export const deselectEditor = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.deselect(editor as any);
