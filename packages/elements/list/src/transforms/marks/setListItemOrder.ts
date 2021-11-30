import { getChildren, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlateEditor,
  TAncestor,
} from '@udecode/plate-core';
import { isEqual } from 'lodash';
import { NodeEntry } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../../defaults';
import { getListTypes } from '../../queries';

export const setListItemOrder = (
  type: string,
  editor: PlateEditor,
  node: NodeEntry<TAncestor>,
  orders: number[] = []
): void => {
  const liType = getPlatePluginType(editor, ELEMENT_LI);
  const licType = getPlatePluginType(editor, ELEMENT_LIC);

  const children = getChildren(node);
  let index = 1;
  for (const c of children) {
    const [child, childPath] = c;
    // It is just a wrapper, do not have any affect to order
    // It just inherit its parent order
    if (getListTypes(editor).includes(child.type)) {
      let _orders = orders;
      // if the parent and child have different types we have to restart the ordering
      if (type !== child.type) {
        _orders = [];
      }

      setListItemOrder(child.type, editor, c, _orders);

      if (!isEqual(child.order, _orders)) {
        setNodes(editor, { order: _orders }, { at: childPath });
      }
    }
    // it is a child of an <ol> and it has to increase the index and it has to extend the orders
    if (child.type === liType) {
      setListItemOrder(type, editor, c, [...orders, index]);

      if (!isEqual(child.order, [...orders, index])) {
        setNodes(editor, { order: [...orders, index] }, { at: childPath });
      }
      index++;
    }
    // List item content we don't care what it holds
    // It just inherit its parent order
    if (child.type === licType) {
      if (!isEqual(child.order, orders) || child.parentType !== type) {
        setNodes(
          editor,
          { parentType: type, order: orders },
          { at: childPath }
        );
      }
    }
  }
};
