import { getAbove, getNodes, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  getPlatePluginType,
  PlateEditor,
  TElement,
  TNode,
} from '@udecode/plate-core';
import { cloneDeep, isEmpty } from 'lodash';
import { NodeEntry } from 'slate';
import { ELEMENT_LIC, KEY_LIST } from '../defaults';
import { PreviousStates, WithListOptions } from '../types';

export const normalizeListItemContentMarkToMarkers = (
  editor: PlateEditor,
  [node, path]: NodeEntry<TNode>
): void => {
  const licType = getPlatePluginType(editor, ELEMENT_LIC);
  const { marks } = getPlatePluginOptions<Required<WithListOptions>>(
    editor,
    KEY_LIST
  );

  if (node.text !== undefined) {
    const licEntry = getAbove(editor, {
      at: path,
      match: { type: licType },
    }) as NodeEntry<TNode>;
    if (licEntry) {
      const [licNode, licPath] = licEntry;
      const textNodes = Array.from(
        getNodes(editor, {
          match: (n) => n.text !== undefined,
          at: licPath,
        })
      );
      if (!textNodes.length) {
        return;
      }

      const types: string[] = marks ? marks.map((value) => value.nodeKey) : [];

      const entries: [string, unknown][] = types
        .map((key: string): [string, boolean, unknown] => {
          const firstNode: TElement | undefined = textNodes[0][0] as TElement;
          const firstValue = firstNode[key];
          const isAllTheSame = textNodes.reduce(
            (acc: boolean, [n]: NodeEntry) => n[key] === firstValue && acc,
            !!(firstValue ?? true)
          );
          return [key, isAllTheSame, firstValue];
        })
        .filter(([, same]) => same)
        .map(([key, , value]) => [key, value]);

      const changeSet: Partial<Record<keyof PreviousStates, unknown>> = {};
      const previousSet: PreviousStates = cloneDeep(licNode.prev ?? {});

      if (entries.length) {
        entries.forEach(([key, value]) => {
          const typedKey = key as keyof PreviousStates;
          const prev = licNode.prev as PreviousStates;
          const oldValue = prev ? prev[typedKey]?.text : undefined;
          if (oldValue !== value) {
            changeSet[typedKey] = value;
            previousSet[typedKey] = {
              text: value,
              dirty: true,
            };
          }
        });
      }

      if (!isEmpty(changeSet)) {
        setNodes(
          editor,
          { ...changeSet, prev: previousSet },
          { at: licEntry[1] }
        );
      }
    }
  }
};
