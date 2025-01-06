import type { SelectionSetPointOptions } from 'slate/dist/interfaces/transforms/selection';

import { type Point, setPoint as setPointBase } from 'slate';

import type { Editor } from '../../interfaces';

export const setPoint = (
  editor: Editor,
  props: Partial<Point>,
  options?: SelectionSetPointOptions
) => {
  setPointBase(editor as any, props, options);
};
