import { type OverrideEditor, ElementApi } from 'platejs';

import { getEquationExpression } from './getEquationExpression.internal';

export const withEquation: OverrideEditor = ({
  editor,
  tf: { normalizeNode },
  type,
}) => ({
  transforms: {
    normalizeNode(entry) {
      const [node, path] = entry;

      if (
        ElementApi.isElement(node) &&
        node.type === type &&
        typeof node.texExpression !== 'string'
      ) {
        editor.tf.setNodes(
          {
            texExpression: getEquationExpression({
              texExpression: node.texExpression,
            }),
          },
          { at: path }
        );

        return;
      }

      return normalizeNode(entry);
    },
  },
});
