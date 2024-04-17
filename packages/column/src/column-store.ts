import {
  findNodePath,
  setNodes,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN, ELEMENT_COLUMN_GROUP } from './createColumnPlugin';
import { TColumnElement, TColumnGroupElement } from './types';

export const useColumnState = () => {
  const editor = useEditorRef();

  const columnGroupElement =
    useElement<TColumnGroupElement>(ELEMENT_COLUMN_GROUP);

  const element = useElement<TColumnElement>(ELEMENT_COLUMN);

  const columnPath = findNodePath(editor, columnGroupElement);

  const setDoubleColumn = () => {
    setNodes(editor, { layout: '1-1' }, { at: columnPath });
  };

  const setThreeColumn = () => {
    setNodes(editor, { layout: '1-1-1' }, { at: columnPath });
  };

  const setRightSideDoubleColumn = () => {
    setNodes(editor, { layout: '3-1' }, { at: columnPath });
  };

  const setLeftSideDoubleColumn = () => {
    setNodes(editor, { layout: '1-3' }, { at: columnPath });
  };

  const setDoubleSideDoubleColumn = () => {
    setNodes(editor, { layout: '1-2-1' }, { at: columnPath });
  };

  return {
    element,
    columnGroupElement,
    setDoubleColumn,
    setDoubleSideDoubleColumn,
    setLeftSideDoubleColumn,
    setRightSideDoubleColumn,
    setThreeColumn,
  };
};
