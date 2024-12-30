import type { SelectionSetPointOptions } from 'slate/dist/interfaces/transforms/selection';

import { type Point, Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

export const setPoint = (
  editor: TEditor,
  props: Partial<Point>,
  options?: SelectionSetPointOptions
) => {
  Transforms.setPoint(editor as any, props, options);
};
