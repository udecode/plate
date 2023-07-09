import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';

import { TReactEditor } from '../types/TReactEditor';

/**
 * Insert data from a `DataTransfer` into the editor.
 */
export const insertData = <V extends Value>(
  editor: TReactEditor<V>,
  data: DataTransfer
) => ReactEditor.insertData(editor as any, data);
