import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Sets data from the currently selected fragment on a `DataTransfer`. */
export const setFragmentData = (editor: TReactEditor, data: DataTransfer) =>
  ReactEditor.setFragmentData(editor as any, data);
