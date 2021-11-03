import { getChildren, getNode, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginType,
  SPEditor,
  TAncestor,
  TNode,
} from '@udecode/plate-core';
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  getListRoot,
  getListTypes,
} from '@udecode/plate-list';
import { isEqual } from 'lodash';
import { NodeEntry, Path } from 'slate';

const setNodeOrder = (
  type: 'ol' | 'ul',
  editor: SPEditor,
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
      if (type !== child.type) {
        _orders = [];
      }

      setNodeOrder(child.type, editor, c, _orders);

      if (!isEqual(child.order, _orders)) {
        setNodes(editor, { order: _orders }, { at: childPath });
      }
    }
    // it is a child of an <ol> and it has to increase the index and it has to extend the orders
    if (child.type === liType) {
      setNodeOrder(type, editor, c, [...orders, index]);

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

export const fixOrders = (editor: SPEditor, location: Path): void => {
  if (!location) return;

  const olType = getPlatePluginType(editor, ELEMENT_OL);
  let root = getListRoot(editor, location) as NodeEntry<TAncestor>;

  if (!root) {
    const node = getNode<TNode>(editor, location);
    if (node?.type === olType) {
      root = [node as TAncestor, location];
    }
  }

  if (root) {
    if (root[0]?.type === olType) {
      setNodeOrder('ol', editor, root);
    } else {
      setNodeOrder('ul', editor, root);
    }
  }
};
