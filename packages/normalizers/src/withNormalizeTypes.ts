import {
  getNode,
  insertElements,
  isElement,
  PlateEditor,
  setElements,
  TElement,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import { NormalizeTypesPlugin } from './createNormalizeTypesPlugin';

export const withNormalizeTypes = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options: { rules, onError } }: WithPlatePlugin<NormalizeTypesPlugin, V, E>
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (currentPath.length === 0) {
      const endCurrentNormalizationPass = rules!.some(
        ({ strictType, type, path }) => {
          const node = getNode<TElement>(editor, path);

          if (node) {
            if (strictType && isElement(node) && node.type !== strictType) {
              setElements(
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
              insertElements(
                editor,
                {
                  type: strictType ?? type!,
                  children: [{ text: '' }],
                },
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
