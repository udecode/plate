import { getNodes, setNodes } from '@udecode/plate-common';
import {
  AnyObject,
  getPlatePluginType,
  PlateEditor,
  TNode,
} from '@udecode/plate-core';
import { castArray } from 'lodash';
import { Editor, NodeEntry, Path, Point, Range } from 'slate';
import { ELEMENT_LIC } from '../../defaults';
import { PreviousStates } from '../../types';

/**
 * Remove markers on the selected lic, if a specific path is not provided it uses the editor.selection
 * @param {PlateEditor} editor
 * @param {string | string[]} type
 * @param {{at: Location}} options
 */
export const removeListItemContentMark = (
  editor: PlateEditor,
  type: string | string[],
  options?: {
    at?: Path | Point | Range;
    filter?: (
      nodeEntry: NodeEntry<TNode<AnyObject>>,
      index: number,
      nodeEntries: NodeEntry<TNode<AnyObject>>[]
    ) => boolean;
  }
) => {
  const types = castArray(type);
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
    nodeEntries.forEach((nodeEntry) => {
      const changeSet: Partial<Record<keyof PreviousStates, unknown>> = {};
      const prev: PreviousStates = nodeEntry[0].prev ?? {};

      types.forEach((key) => {
        changeSet[key as keyof PreviousStates] = null;
        prev[key as keyof PreviousStates] = {
          ...(prev[key as keyof PreviousStates] || {}),
          dirty: false,
        };
      });

      setNodes(
        editor,
        {
          ...changeSet,
          prev,
        },
        { at: nodeEntry[1] }
      );
    });
  });
};
