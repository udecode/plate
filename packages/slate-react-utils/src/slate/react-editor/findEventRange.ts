import { Value } from '@udecode/slate-utils';
import { ReactEditor } from 'slate-react';
import { TReactEditor } from './TReactEditor';

/**
 * {@link ReactEditor.findEventRange}
 */
export const findEventRange = <V extends Value>(
  editor: TReactEditor<V>,
  event: any
) => {
  try {
    return ReactEditor.findEventRange(editor as any, event);
  } catch (e) {}
};
