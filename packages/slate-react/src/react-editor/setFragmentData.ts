import type { TEditor } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

/** Sets data from the currently selected fragment on a `DataTransfer`. */
export const setFragmentData = (editor: TEditor, data: DataTransfer) =>
  ReactEditor.setFragmentData(editor as any, data);
