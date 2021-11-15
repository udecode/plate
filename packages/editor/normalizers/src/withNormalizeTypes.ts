import { getNode, insertNodes, setNodes } from '@udecode/plate-common';
import { isElement, TElement, WithOverride } from '@udecode/plate-core';
import { NormalizeTypesPlugin } from './createNormalizeTypesPlugin';

export const withNormalizeTypes: WithOverride<{}, NormalizeTypesPlugin> = (
  editor,
  { options: { rules, onError } }
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const endCurrentNormalizationPass = rules!.some(
        ({ strictType, type, path }) => {
          const node = getNode(editor, path);

          if (node) {
            if (strictType && isElement(node) && node.type !== strictType) {
              setNodes<TElement>(
                editor,
                { type: strictType },
                {
                  at: path,
                }
              );
              return true;
            }
          } else {
            try {
              insertNodes<TElement>(
                editor,
                {
                  type: strictType ?? type!,
                  children: [{ text: '' }],
                },
                { at: path }
              );
              return true;
            } catch (err) {
              onError?.(err);
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
  };

  return editor;
};
