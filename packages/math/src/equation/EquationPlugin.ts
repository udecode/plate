import { createPlugin } from '@udecode/plate-common';

import 'katex/dist/katex.min.css';

export const EquationPlugin = createPlugin({
  isElement: true,
  isVoid: true,
  key: 'equation',
});
