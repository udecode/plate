import { getNodes, setNodes } from '@udecode/plate-common';
import {
  AnyObject,
  getPlatePluginType,
  PlateEditor,
  TNode,
} from '@udecode/plate-core';
import { Editor, NodeEntry, Path, Point, Range } from 'slate';
import { ELEMENT_LIC } from '../../defaults';
import { PreviousStates } from '../../types';

export const setListItemContentMark = (
  editor: PlateEditor,
  type: string,
  value: unknown,
  options?: {
    at?: Path | Point | Range;
    filter?: (
      nodeEntry: NodeEntry<TNode<AnyObject>>,
      index: number,
      nodeEntries: NodeEntry<TNode<AnyObject>>[]
    ) => boolean;
  }
) => {
  const filter = options?.filter ?? (() => true);
  const licType = getPlatePluginType(editor, ELEMENT_LIC);
  const location: Path | Point | Range | null =
    options?.at ?? editor?.selection;
  if (!location) {
    return null;
  }
  const nodeEntries = Array.from(
    getNodes(editor, {
      at: location,
      match: { type: licType },
    })
  ).filter(filter);

  Editor.withoutNormalizing(editor, () => {
    nodeEntries.forEach(([node, path]) => {
      const prev: PreviousStates = node.prev ?? {};
      Editor.withoutNormalizing(editor, () => {
        setNodes(
          editor,
          {
            [type]: value,
            prev: {
              ...prev,
              [type]: { ...(prev[type] ?? {}), dirty: true },
            },
          },
          { at: path }
        );
      });
    });
  });
};
