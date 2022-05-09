import { ReactEditor } from 'slate-react';
import { Value } from '../editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Insert data from a `DataTransfer` into the editor.
 */
export const insertData = <V extends Value>(
  editor: TReactEditor<V>,
  data: DataTransfer
) => ReactEditor.insertData(editor as any, data);
