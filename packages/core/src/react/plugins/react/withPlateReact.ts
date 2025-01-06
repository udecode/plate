import type { ExtendEditor } from '../../../lib';

import { withReact } from '../../slate-react';

export const withPlateReact: ExtendEditor = ({ editor }) => {
  return withReact(editor as any);
};
