import { bindFirst, createSlatePlugin, KEYS } from 'platejs';

import { insertEquation } from './transforms';
import { withEquation } from './withEquation.internal';

import 'katex/dist/katex.min.css';

export const BaseEquationPlugin = createSlatePlugin({
  key: KEYS.equation,
  node: { isElement: true, isVoid: true },
  parsers: {
    html: {
      deserializer: {
        toNodeProps: ({ element }) => ({
          texExpression:
            element.getAttribute('data-slate-tex-expression') ?? '',
        }),
      },
    },
  },
})
  .overrideEditor(withEquation)
  .extendEditorTransforms(({ editor }) => ({
    insert: {
      equation: bindFirst(insertEquation, editor),
    },
  }));
