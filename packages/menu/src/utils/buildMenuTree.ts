import type { Action } from '../types';

export function buildMenuTree(actions: Action[] | null) {
  if (!actions) return null;

  return actions.reduce<Action[]>((actions, option) => {
    if (option.groupName) {
      const groupName = actions.find(
        (action) => action.label === option.groupName
      );

      if (groupName) {
        groupName.items!.push(option);
      } else {
        actions.push({ items: [option], label: option.groupName });
      }
    } else {
      actions.push(option);
    }

    return actions;
  }, []);
}
