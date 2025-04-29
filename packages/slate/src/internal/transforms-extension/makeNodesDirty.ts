import type { Editor, MakeNodesDirtyOptions } from '../../interfaces';

import { withoutNormalizing } from '../editor/withoutNormalizing';
import { setNodes } from '../transforms/setNodes';
import { unsetNodes } from '../transforms/unsetNodes';

export const makeNodesDirty = <E extends Editor>(
  editor: E,
  options?: MakeNodesDirtyOptions
) => {
  withoutNormalizing(editor, () => {
    setNodes(editor, { _dirty: true } as any, options);
    unsetNodes(editor, '_dirty', options);
  });
};
