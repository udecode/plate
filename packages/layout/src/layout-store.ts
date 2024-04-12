import {
  findNodePath,
  setNodes,
  TElement,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';

import { ELEMENT_LAYOUT, ELEMENT_LAYOUT_CHILD } from './createLayoutPlugin';

export interface TLayoutChildElement extends TElement {
  id?: string;
  type: 'layout_child';
  width: string;
}

export interface TLayoutBlockElement extends TElement {
  id?: string;
  type: 'layout';
  layout?: '1-1' | '1-1-1' | '3-1' | '1-3' | '1-2-1';
  children: TLayoutChildElement[];
}

export const useLayoutState = () => {
  const editor = useEditorRef();

  const layoutElement = useElement<TLayoutBlockElement>(ELEMENT_LAYOUT);
  const element = useElement<TLayoutChildElement>(ELEMENT_LAYOUT_CHILD);

  const layoutPath = findNodePath(editor, layoutElement);

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
    layoutElement,
    setDoubleColumn,
    setDoubleSideDoubleColumn,
    setLeftSideDoubleColumn,
    setRightSideDoubleColumn,
    setThreeColumn,
  };
};
