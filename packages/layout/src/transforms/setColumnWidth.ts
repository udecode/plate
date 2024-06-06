import type { PathRef } from 'slate';

import {
  type PlateEditor,
  type Value,
  getChildren,
  getNodeEntry,
  isElement,
  setNodes,
} from '@udecode/plate-common/server';

import type { TColumnElement, TColumnGroupElement } from '../types';

import { ELEMENT_COLUMN } from '../createColumnPlugin';

export const setColumnWidth = <V extends Value>(
  editor: PlateEditor<V>,
  groupPathRef: PathRef,
  layout: Required<TColumnGroupElement>['layout']
) => {
  const path = groupPathRef.unref()!;

  const columnGroup = getNodeEntry(editor, path);

  if (!columnGroup) throw new Error(`can not find the column group in ${path}`);

  const children = getChildren(columnGroup);

  const childPaths = Array.from(children, (item) => item[1]);

  childPaths.forEach((item, index) => {
    const width = layout[index] + '%';

    if (!width) return;

    setNodes<TColumnElement>(
      editor,
      { width: width },
      {
        at: item,
        match: (n) => isElement(n) && n.type === ELEMENT_COLUMN,
      }
    );
  });
};
