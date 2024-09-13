import { createSlatePlugin } from '@udecode/plate-common';

import 'katex/dist/katex.min.css';

export const BaseEquationPlugin = createSlatePlugin({
  key: 'equation',
  node: { isElement: true, isVoid: true },
});
