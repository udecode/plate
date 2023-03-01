import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Sets data from the currently selected fragment on a `DataTransfer`.
 */
export const setFragmentData = <V extends Value>(
  editor: TReactEditor<V>,
  data: DataTransfer
) => ReactEditor.setFragmentData(editor as any, data);
