import { useMemo } from 'react';

import type { SlateEditor, Value } from '@udecode/plate-common';

import {
  atom,
  createAtomStore,
  plateStore,
  usePlateStore,
} from '@udecode/plate-common/react';
import { IndentPlugin, type TIndentElement } from '@udecode/plate-indent';

import { TogglePlugin } from './TogglePlugin';

// Duplicate constant instead of importing from "plate-indent-list" to avoid a dependency.
const IndentListPluginKey = 'listStyleType';

export const {
  ToggleControllerProvider,
  toggleControllerStore,
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

export const someToggleClosed = (
  editor: SlateEditor,
  toggleIds: string[]
): boolean => {
  const openIds = editor.getOptions(TogglePlugin).openIds!;

  return toggleIds.some((id) => !openIds.has(id));
};

export const isToggleOpen = (
  editor: SlateEditor,
  toggleId: string
): boolean => {
  const openIds = editor.getOptions(TogglePlugin).openIds!;

  return openIds.has(toggleId);
};

export const toggleIds = (
  editor: SlateEditor,
  ids: string[],
  force: boolean | null = null
): void => {
  editor.getOptions(TogglePlugin).setOpenIds!((openIds) =>
    _toggleIds(openIds, ids, force)
  );
};

const _toggleIds = (
  openIds: Set<string>,
  ids: string[],
  force: boolean | null = null
) => {
  const newOpenIds = new Set(openIds.values());
  ids.forEach((id) => {
    const isCurrentlyOpen = openIds.has(id);
    const newIsOpen = force === null ? !isCurrentlyOpen : force;

    if (newIsOpen) {
      newOpenIds.add(id);
    } else {
      newOpenIds.delete(id);
    }
  });

  return newOpenIds;
};

// Returns, for each child, the enclosing toggle ids
export const buildToggleIndex = (elements: Value): Map<string, string[]> => {
  const result = new Map<string, string[]>();
  let currentEnclosingToggles: [string, number][] = []; // [toggleId, indent][]
  elements.forEach((element) => {
    const elementIndent = (element[IndentPlugin.key] as number) || 0;
    // For some reason, indent lists have a min indent of 1, even though they are not indented
    const elementIndentWithIndentListCorrection =
      element[IndentListPluginKey] && element[IndentPlugin.key]
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

    if (element.type === TogglePlugin.key) {
      currentEnclosingToggles.push([element.id as string, elementIndent]);
    }
  });

  return result;
};
