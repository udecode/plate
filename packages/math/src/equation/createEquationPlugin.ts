import { createPluginFactory } from '@udecode/plate-common/server';

import 'katex/dist/katex.min.css';

export const ELEMENT_EQUATION = 'equation';

export const createEquationPlugin = createPluginFactory({
  isElement: true,
  isVoid: true,
  key: ELEMENT_EQUATION,
});
