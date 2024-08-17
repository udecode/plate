import { withReact } from 'slate-react';

import type { WithOverride } from '../../../lib/plugin/SlatePlugin';

export const withPlateReact: WithOverride = ({ editor }) => {
  return withReact(editor as any);
};
