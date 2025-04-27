import type { DomConfig, ExtendEditor } from '../../../lib';

import { withReact } from '../../slate-react';

export const withPlateReact: ExtendEditor<DomConfig> = ({ editor }) => {
  return withReact(editor as any);
};
