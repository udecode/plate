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

  const ColumnGroupElement =
    useElement<TColumnGroupElement>(ELEMENT_COLUMN_GROUP);
  const element = useElement<TColumnElement>(ELEMENT_COLUMN);

  const layoutPath = findNodePath(editor, ColumnGroupElement);

  const setDoubleColumn = () => {
    setNodes(editor, { layout: '1-1' }, { at: layoutPath });
  };

  const setThreeColumn = () => {
    setNodes(editor, { layout: '1-1-1' }, { at: layoutPath });
  };

  const setRightSideDoubleColumn = () => {
    setNodes(editor, { layout: '3-1' }, { at: layoutPath });
  };

  const setLeftSideDoubleColumn = () => {
    setNodes(editor, { layout: '1-3' }, { at: layoutPath });
  };

  const setDoubleSideDoubleColumn = () => {
    setNodes(editor, { layout: '1-2-1' }, { at: layoutPath });
  };

  return {
    element,
    ColumnGroupElement,
    setDoubleColumn,
    setDoubleSideDoubleColumn,
    setLeftSideDoubleColumn,
    setRightSideDoubleColumn,
    setThreeColumn,
  };
};
