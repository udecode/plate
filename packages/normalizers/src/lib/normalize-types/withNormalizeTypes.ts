import {
  type OverrideEditor,
  type TElement,
  ElementApi,
  NodeApi,
} from '@udecode/plate';

import type { NormalizeTypesConfig } from './NormalizeTypesPlugin';

export const withNormalizeTypes: OverrideEditor<NormalizeTypesConfig> = ({
  editor,
  getOptions,
  tf: { normalizeNode },
}) => ({
  transforms: {
    normalizeNode([currentNode, currentPath]) {
      const { rules, onError } = getOptions();

      if (currentPath.length === 0) {
        const endCurrentNormalizationPass = rules!.some(
          ({ path, strictType, type }) => {
            const node = NodeApi.get<TElement>(editor, path);

            if (node) {
              if (
                strictType &&
                ElementApi.isElement(node) &&
                node.type !== strictType
              ) {
                const { children, ...props } = editor.api.create.block({
                  type: strictType,
                });
                editor.tf.setNodes(props, {
                  at: path,
                });

                return true;
              }
            } else {
              try {
                editor.tf.insertNodes(
                  editor.api.create.block({ type: strictType ?? type! }),
                  { at: path }
                );

                return true;
              } catch (error) {
                onError?.(error);
              }
            }

            return false;
          }
        );

        if (endCurrentNormalizationPass) {
          return;
        }
      }

      return normalizeNode([currentNode, currentPath]);
    },
  },
});
