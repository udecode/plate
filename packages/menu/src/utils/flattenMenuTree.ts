import type { Action } from '../types';

export function flattenMenuTree(actions: Action[]): Action[] {
  return actions.flatMap((item) => {
    if (item.items) {
      const parentGroup = item.group ?? item.label;
      const groupName = item.label;

      return flattenMenuTree(
        item.items.map(({ group, ...item }) => ({
          ...item,
          group: group ?? parentGroup,
          groupName,
        }))
      );
    }

    return item;
  });
}
