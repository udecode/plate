import type { Value } from '@udecode/slate';
import type { DOMPoint } from 'slate-react/dist/utils/dom';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** {@link ReactEditor.toSlatePoint} */
export const toSlatePoint = <V extends Value>(
  editor: TReactEditor<V>,
  domPoint: DOMPoint,
  options: Parameters<typeof ReactEditor.toSlatePoint>[2]
) => {
  try {
    return ReactEditor.toSlatePoint(editor as any, domPoint, options);
  } catch (error) {}
};
