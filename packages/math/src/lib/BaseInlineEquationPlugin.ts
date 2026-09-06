import { bindFirst, createSlatePlugin, KEYS } from 'platejs';

import { insertInlineEquation } from './transforms';
import { withEquation } from './withEquation.internal';

export const BaseInlineEquationPlugin = createSlatePlugin({
  key: KEYS.inlineEquation,
  node: { isElement: true, isInline: true, isVoid: true },
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
      inlineEquation: bindFirst(insertInlineEquation, editor),
    },
  }));
