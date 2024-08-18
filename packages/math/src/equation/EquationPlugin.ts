import { createSlatePlugin } from '@udecode/plate-common';

import 'katex/dist/katex.min.css';

export const EquationPlugin = createSlatePlugin({
  isElement: true,
  isVoid: true,
  key: 'equation',
});
