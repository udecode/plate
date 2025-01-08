import type { ExtendEditor } from '../../../lib';

import { withReact } from '../../slate-react';

export const withPlateReact: ExtendEditor = ({ editor }) => {
  const e = withReact(editor as any);

  return e;
};
