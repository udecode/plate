import { useEditorSelector, usePluginOption } from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { TogglePlugin } from './TogglePlugin';

const ListPluginKey = 'listStyleType';

export const buildToggleIndex = (
  elements: readonly Element[]
): Map<string, string[]> => {
  const result = new Map<string, string[]>();
  let currentEnclosingToggles: [string, number][] = [];

  elements.forEach((element) => {
    if (typeof element.id !== 'string') return;

    const indentValue = element[KEYS.indent];
    const elementIndent = typeof indentValue === 'number' ? indentValue : 0;
    const elementIndentWithListCorrection =
      element[ListPluginKey] && elementIndent
        ? elementIndent - 1
        : elementIndent;

    currentEnclosingToggles = currentEnclosingToggles.filter(
      ([, indent]) => indent < elementIndentWithListCorrection
    );
    result.set(
      element.id,
      currentEnclosingToggles.map(([toggleId]) => toggleId)
    );

    if (element.type === KEYS.toggle) {
      currentEnclosingToggles.push([element.id, elementIndent]);
    }
  });

  return result;
};

export const useIsVisible = (elementId: string) => {
  const openIds = usePluginOption(TogglePlugin, 'openIds');
  const toggleIndex = usePluginOption(TogglePlugin, 'toggleIndex');

  return (toggleIndex.get(elementId) ?? []).every((enclosedId) =>
    openIds.has(enclosedId)
  );
};

export const useToggleIndex = () =>
  useEditorSelector((editor) => buildToggleIndex(editor.read.children()), []);
