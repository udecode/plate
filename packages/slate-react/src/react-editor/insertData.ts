import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Insert data from a `DataTransfer` into the editor. */
export const insertData = (editor: TReactEditor, data: DataTransfer) =>
  ReactEditor.insertData(editor as any, data);
