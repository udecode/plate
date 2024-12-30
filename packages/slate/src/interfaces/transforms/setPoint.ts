import type { SelectionSetPointOptions } from 'slate/dist/interfaces/transforms/selection';

import { type Point, setPoint as setPointBase } from 'slate';

import type { TEditor } from '../editor/TEditor';

export const setPoint = (
  editor: TEditor,
  props: Partial<Point>,
  options?: SelectionSetPointOptions
) => {
  setPointBase(editor as any, props, options);
};
