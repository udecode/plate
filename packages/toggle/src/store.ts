import {
  atom,
  createAtomStore,
  getPluginOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_TOGGLE, TogglePlugin } from './types';

export const {
  toggleControllerStore,
  ToggleControllerProvider,
  useToggleControllerStore,
} = createAtomStore(
  {
    openIds: atom(new Set<string>()),
  },
  { name: 'toggleController' as const }
);

export const someToggleClosed = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  toggleIds: string[]
): boolean => {
  const options = getPluginOptions<TogglePlugin, V, E>(editor, ELEMENT_TOGGLE);
  const openIds = options.openIds;
  return toggleIds.some((id) => !openIds.has(id));
};

export const isToggleOpen = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  toggleId: string
): boolean => {
  const options = getPluginOptions<TogglePlugin, V, E>(editor, ELEMENT_TOGGLE);
  const openIds = options.openIds;
  return openIds.has(toggleId);
};

export const toggleIds = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  toggleIds: string[],
  force: boolean | undefined = undefined
): void => {
  const options = getPluginOptions<TogglePlugin, V, E>(editor, ELEMENT_TOGGLE);
  options.setOpenIds((openIds) => _toggleIds(openIds, toggleIds, force));
};

const _toggleIds = (
  openIds: Set<string>,
  toggleIds: string[],
  force: boolean | undefined = undefined
) => {
  const newOpenIds = new Set(openIds.values());
  toggleIds.forEach((toggleId) => {
    const isCurrentlyOpen = openIds.has(toggleId);
    const newIsOpen = force === undefined ? !isCurrentlyOpen : force;
    if (newIsOpen) {
      newOpenIds.add(toggleId);
    } else {
      newOpenIds.delete(toggleId);
    }
  });
  return newOpenIds;
};
