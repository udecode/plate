import { setPoint as setPointBase } from 'slate';
import type { SelectionSetPointOptions } from 'slate/dist/interfaces/transforms/selection';

import type { Editor } from '../../interfaces';
import type { Point } from '../../interfaces/point';

export const setPoint = (
  editor: Editor,
  props: Partial<Point>,
  options?: SelectionSetPointOptions
) => {
  setPointBase(editor as any, props, options);
};
