import {
  getChildren,
  isElement,
  PlateEditor,
  setNodes,
  TNode,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN } from '../createLayoutPlugin';
import { TColumnElement, TColumnGroupElement } from '../types';

export const setColumnWidth = <V extends Value, N extends TNode>(
  editor: PlateEditor<V>,
  [node, path]: TNodeEntry<N>,
  layout: TColumnGroupElement['layout']
) => {
  const children = getChildren([node, path]);
  const childPaths = Array.from(children, (item) => item[1]);

  if (layout === '1-1-1') {
    if (childPaths.length !== 3) return;
    childPaths.forEach((item) => {
      setNodes<TColumnElement>(
        editor,
        { width: '33%' },
        {
          at: item,
          match: (n) => isElement(n) && n.type === ELEMENT_COLUMN,
        }
      );
    });
  }

  if (layout === '1-2-1') {
    if (childPaths.length !== 3) return;
    childPaths.forEach((item, index) => {
      let width = '20%';

      if (index === 0 || index === 2) width = '20%';
      if (index === 1) width = '60%';

      setNodes<TColumnElement>(
        editor,
        { width: width },
        {
          at: item,
          match: (n) => isElement(n) && n.type === ELEMENT_COLUMN,
        }
      );
    });
  }

  if (layout === '1-1') {
    if (childPaths.length !== 2) return;
    childPaths.forEach((item) => {
      setNodes<TColumnElement>(
        editor,
        { width: '50%' },
        {
          at: item,
          match: (n) => isElement(n) && n.type === ELEMENT_COLUMN,
        }
      );
    });
  }

  if (layout === '3-1') {
    if (childPaths.length !== 2) return;
    childPaths.forEach((item, index) => {
      setNodes<TColumnElement>(
        editor,
        { width: index === 0 ? '70%' : '30%' },
        {
          at: item,
          match: (n) => isElement(n) && n.type === ELEMENT_COLUMN,
        }
      );
    });
  }

  if (layout === '1-3') {
    if (childPaths.length !== 2) return;
    childPaths.forEach((item, index) => {
      setNodes<TColumnElement>(
        editor,
        { width: index === childPaths.length - 1 ? '70%' : '30%' },
        {
          at: item,
          match: (n) => isElement(n) && n.type === ELEMENT_COLUMN,
        }
      );
    });
  }
};
