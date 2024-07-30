import type { DOMPoint } from 'slate-react/dist/utils/dom';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** {@link ReactEditor.toSlatePoint} */
export const toSlatePoint = (
  editor: TReactEditor,
  domPoint: DOMPoint,
  options: Parameters<typeof ReactEditor.toSlatePoint>[2]
) => {
  try {
    return ReactEditor.toSlatePoint(editor as any, domPoint, options);
  } catch (error) {}
};
