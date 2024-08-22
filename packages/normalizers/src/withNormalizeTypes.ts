import {
  type PlateEditor,
  type TElement,
  type Value,
  type WithPlatePlugin,
  getNode,
  insertElements,
  isElement,
  setElements,
} from '@udecode/plate-common/server';

import type { NormalizeTypesPlugin } from './createNormalizeTypesPlugin';

export const withNormalizeTypes = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options: { onError, rules } }: WithPlatePlugin<NormalizeTypesPlugin, V, E>
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (currentPath.length === 0) {
      const endCurrentNormalizationPass = rules!.some(
        ({ path, strictType, type }) => {
          const node = getNode<TElement>(editor, path);

          if (node) {
            if (strictType && isElement(node) && node.type !== strictType) {
              const { children, ...props } = editor.blockFactory({
                type: strictType,
              });
              setElements(editor, props, {
                at: path,
              });

              return true;
            }
          } else {
            try {
              insertElements(
                editor,
                editor.blockFactory({ type: strictType ?? type! }),
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
  };

  return editor;
};
