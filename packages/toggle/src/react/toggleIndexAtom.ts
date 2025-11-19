import { useMemo } from 'react';

import type { TIndentElement, Value } from 'platejs';

import { KEYS } from 'platejs';
import {
  atom,
  plateStore,
  usePlateStore,
  usePluginOption,
  useStoreAtomValue,
} from 'platejs/react';

import { TogglePlugin } from './TogglePlugin';

// Duplicate constant instead of importing from "plate-list" to avoid a dependency.
const ListPluginKey = 'listStyleType';

// Returns, for each child, the enclosing toggle ids
export const buildToggleIndex = (elements: Value): Map<string, string[]> => {
  const result = new Map<string, string[]>();
  let currentEnclosingToggles: [string, number][] = []; // [toggleId, indent][]
  elements.forEach((element) => {
    const elementIndent = (element[KEYS.indent] as number) || 0;
    // For some reason, indent lists have a min indent of 1, even though they are not indented
    const elementIndentWithListCorrection =
      element[ListPluginKey] && element[KEYS.indent]
        ? elementIndent - 1
        : elementIndent;

    const enclosingToggles = currentEnclosingToggles.filter(
      ([_, indent]) => indent < elementIndentWithListCorrection
    );
    currentEnclosingToggles = enclosingToggles;
    result.set(
      element.id as string,
      enclosingToggles.map(([toggleId]) => toggleId)
    );

    if (element.type === KEYS.toggle) {
      currentEnclosingToggles.push([element.id as string, elementIndent]);
    }
  });

  return result;
};

export const editorAtom = plateStore.atom.trackedEditor;

// Due to a limitation of jotai-x, it's not possible to derive a state from both `toggleControllerStore` and plateStore`.
// In order minimize re-renders, we subscribe to both separately, but only re-render unnecessarily when opening or closing a toggle,
//   which is less frequent than changing the editor's children.
export const useIsVisible = (elementId: string) => {
  const openIds = usePluginOption(TogglePlugin, 'openIds')!;
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

  return useStoreAtomValue(usePlateStore(), isVisibleAtom);
};

export const toggleIndexAtom = atom((get) =>
  buildToggleIndex(get(editorAtom).editor.children as TIndentElement[])
);

export const useToggleIndex = () =>
  useStoreAtomValue(usePlateStore(), toggleIndexAtom);
