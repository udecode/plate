import {
  ELEMENT_DEFAULT,
  getAboveNode,
  getCommonNode,
  getNodeEntries,
  getPluginType,
  isElement,
  PlateEditor,
  setElements,
  unwrapNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../createListPlugin';

export const unwrapList = <V extends Value>(
  editor: PlateEditor<V>,
  { at }: { at?: Path } = {}
) => {
  const foundAnyListNodes = () => {
    const listNodes = getNodeEntries(editor, {
      at,
      match: {
        type: [
          getPluginType(editor, ELEMENT_LI),
          getPluginType(editor, ELEMENT_UL),
          getPluginType(editor, ELEMENT_OL),
        ],
      }
    });

    return Array.from(listNodes).length;
  };

  withoutNormalizing(editor, () => {
    do {
      setElements(editor, {
        type: getPluginType(editor, ELEMENT_DEFAULT),
      });

      unwrapNodes(editor, {
        at,
        match: { type: getPluginType(editor, ELEMENT_LI) },
        split: true,
      });

      unwrapNodes(editor, {
        at,
        match: {
          type: [
            getPluginType(editor, ELEMENT_UL),
            getPluginType(editor, ELEMENT_OL),
          ],
        },
        split: true,
      });
    } while (foundAnyListNodes());
  });
};
