import { useMemo } from 'react';
import {
  atom,
  createAtomStore,
  getPluginOptions,
  PlateEditor,
  plateStore,
  usePlateStore,
  Value,
} from '@udecode/plate-common';
import { KEY_INDENT, TIndentElement } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';

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

// Due to a limitation of jotai-x, it's not possible to derive a state from both `toggleControllerStore` and plateStore`.
// In order minimize re-renders, we subscribe to both separately, but only re-render unnecessarily when opening or closing a toggle,
//   which is less frequent than changing the editor's children.
export const useIsVisible = (elementId: string) => {
  const [openIds] = useToggleControllerStore().use.openIds();
  const isVisibleAtom = useMemo(
    () =>
      atom((get) => {
        const toggleIndex = get(toggleIndexAtom);
        const enclosedInToggleIds = toggleIndex.get(elementId) || [];
        return enclosedInToggleIds.every((enclosedId) =>
          openIds.has(enclosedId)
        );
      }),
    [elementId, openIds]
  );

  return usePlateStore().get.atom(isVisibleAtom);
};

const editorAtom = plateStore.atom.trackedEditor;
export const toggleIndexAtom = atom((get) =>
  buildToggleIndex(get(editorAtom).editor.children as TIndentElement[])
);
export const useToggleIndex = () => usePlateStore().get.atom(toggleIndexAtom);

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

// Returns, for each child, the enclosing toggle ids
export const buildToggleIndex = (elements: Value): Map<string, string[]> => {
  const result: Map<string, string[]> = new Map();
  let currentEnclosingToggles: [string, number][] = []; // [toggleId, indent][]
  elements.forEach((element) => {
    const elementIndent = (element[KEY_INDENT] as number) || 0;
    // For some reason, indent lists have a min indent of 1, even though they are not indented
    const elementIndentWithIndentListCorrection =
      element[KEY_LIST_STYLE_TYPE] && element[KEY_INDENT]
        ? elementIndent - 1
        : elementIndent;

    const enclosingToggles = currentEnclosingToggles.filter(([_, indent]) => {
      return indent < elementIndentWithIndentListCorrection;
    });
    currentEnclosingToggles = enclosingToggles;
    result.set(
      element.id as string,
      enclosingToggles.map(([toggleId]) => toggleId)
    );
    if (element.type === ELEMENT_TOGGLE) {
      currentEnclosingToggles.push([element.id as string, elementIndent]);
    }
  });

  return result;
};
