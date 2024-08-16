import { setNodes } from '@udecode/plate-common';
import {
  findNodePath,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';

import type { TColumnGroupElement } from './types';

import { ColumnPlugin } from './ColumnPlugin';

export const useColumnState = () => {
  const editor = useEditorRef();

  const columnGroupElement = useElement<TColumnGroupElement>(ColumnPlugin.key);

  const columnPath = findNodePath(editor, columnGroupElement);

  const setDoubleColumn = () => {
    setNodes(editor, { layout: [50, 50] }, { at: columnPath });
  };

  const setThreeColumn = () => {
    setNodes(editor, { layout: [33, 33, 33] }, { at: columnPath });
  };

  const setRightSideDoubleColumn = () => {
    setNodes(editor, { layout: [70, 30] }, { at: columnPath });
  };

  const setLeftSideDoubleColumn = () => {
    setNodes(editor, { layout: [30, 70] }, { at: columnPath });
  };

  const setDoubleSideDoubleColumn = () => {
    setNodes(editor, { layout: [25, 50, 25] }, { at: columnPath });
  };

  return {
    setDoubleColumn,
    setDoubleSideDoubleColumn,
    setLeftSideDoubleColumn,
    setRightSideDoubleColumn,
    setThreeColumn,
  };
};
