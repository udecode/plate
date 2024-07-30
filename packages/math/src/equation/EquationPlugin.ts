import { createPlugin } from '@udecode/plate-common/server';

import 'katex/dist/katex.min.css';

export const ELEMENT_EQUATION = 'equation';

export const EquationPlugin = createPlugin({
  isElement: true,
  isVoid: true,
  key: ELEMENT_EQUATION,
});
