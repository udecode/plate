import type { Value } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Sets data from the currently selected fragment on a `DataTransfer`. */
export const setFragmentData = <V extends Value>(
  editor: TReactEditor<V>,
  data: DataTransfer
) => ReactEditor.setFragmentData(editor as any, data);
