import { withReact } from 'slate-react';

import type { ExtendEditor } from '../../../lib';

export const withPlateReact: ExtendEditor = ({ editor }) => {
  return withReact(editor as any);
};
