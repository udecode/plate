import { ReactEditor } from 'slate-react';
import { DOMPoint } from 'slate-react/dist/utils/dom';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * {@link ReactEditor.toSlatePoint}
 */
export const toSlatePoint = <V extends Value>(
  editor: TReactEditor<V>,
  domPoint: DOMPoint,
  options: Parameters<typeof ReactEditor.toSlatePoint>[2]
) => {
  try {
    return ReactEditor.toSlatePoint(editor as any, domPoint, options);
  } catch (e) {}
};
