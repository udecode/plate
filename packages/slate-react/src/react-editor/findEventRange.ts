import type { Value } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** {@link ReactEditor.findEventRange} */
export const findEventRange = <V extends Value>(
  editor: TReactEditor<V>,
  event: any
) => {
  try {
    return ReactEditor.findEventRange(editor as any, event);
  } catch (error) {}
};
