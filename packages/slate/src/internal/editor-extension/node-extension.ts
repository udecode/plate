import { isEditor } from 'slate';

import { NodeApi } from '../../interfaces';

export const NodeExtension = {
  *children(root, path, options = {}) {
    const { from, reverse = false, to } = options;
    const ancestor = NodeApi.ancestor(root, path);

    if (!ancestor) return;

    const { children } = ancestor;
    let index = reverse ? children.length - 1 : 0;
    const endIndex = to ?? (reverse ? 0 : children.length);

    if (from !== undefined) {
      index = from;
    }

    while (reverse ? index >= endIndex : index < endIndex) {
      const child = NodeApi.child(ancestor!, index);
      const childPath = path.concat(index);
      yield [child, childPath];
      index = reverse ? index - 1 : index + 1;
    }
  },
  firstChild(root, path) {
    const children = NodeApi.children(root, path);
    const firstChild = children.next().value;

    return firstChild as any;
  },
  firstText(root, options) {
    const texts = NodeApi.texts(root, options);
    const firstText = texts.next().value;

    return firstText as any;
  },
  isEditor: (value: any) => isEditor(value),
  isLastChild(root, path) {
    if (path.length === 0) return false;

    const parent = NodeApi.parent(root, path);

    if (!parent) return false;

    const index = path.at(-1);

    return index === parent.children.length - 1;
  },
  lastChild(root, path) {
    const children = NodeApi.children(root, path, { reverse: true });
    const lastChild = children.next().value;

    return lastChild as any;
  },
} as Pick<
  typeof NodeApi,
  'children' | 'firstChild' | 'firstText' | 'isLastChild' | 'lastChild'
>;
