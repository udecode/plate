import { withReact } from 'slate-react';

import type { WithOverride } from '../../../lib';

export const withPlateReact: WithOverride = ({ editor }) => {
  return withReact(editor as any);
};
