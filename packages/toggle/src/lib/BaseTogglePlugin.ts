import { defineBasePlugin, type DefinitionOf } from '@platejs/core';
import { ElementApi, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type BaseTogglePluginState = {
  openIds: Set<string>;
  toggleIndex: Map<string, string[]>;
};

export const BaseTogglePlugin = defineBasePlugin(KEYS.toggle, {
  initialState: (): BaseTogglePluginState => ({
    openIds: new Set(),
    toggleIndex: new Map(),
  }),
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
}).extend(({ store, type }) => ({
  api: () => ({
    toggleIds: (ids: string[], force: boolean | null = null) => {
      store.set((draft) => {
        if (!draft.openIds) draft.openIds = new Set();

        const { openIds } = draft;

        ids.forEach((id) => {
          const isOpen = openIds.has(id);
          const nextOpen = force === null ? !isOpen : force;

          if (nextOpen) {
            openIds.add(id);
          } else {
            openIds.delete(id);
          }
        });
      });
    },
  }),
  read: ({ state }) => ({
    isActive: () =>
      !!state.selection() &&
      state.nodes.some({
        match: { type },
      }),
    lastEnclosedEntry: (toggleId: string) => {
      let inside = false;
      let last:
        | readonly [ReturnType<typeof state.children>[number], number[]]
        | undefined;
      let toggleIndent = 0;

      state.children().forEach((node, index) => {
        if (!ElementApi.isElement(node)) return;

        const indentValue = node[KEYS.indent];
        const indent = typeof indentValue === 'number' ? indentValue : 0;
        const adjustedIndent =
          node.listStyleType && indent ? indent - 1 : indent;

        if (node.id === toggleId && node.type === type) {
          inside = true;
          toggleIndent = adjustedIndent;
          return;
        }
        if (!inside) return;
        if (adjustedIndent <= toggleIndent) {
          inside = false;
          return;
        }

        last = [node, [index]];
      });

      return last;
    },
  }),
  selectors: {
    enclosingIds: (state, elementId: string) =>
      state.toggleIndex.get(elementId) ?? [],
    isClosed: (state, elementId: string) =>
      (state.toggleIndex.get(elementId) ?? []).some(
        (toggleId) => !state.openIds.has(toggleId)
      ),
    isOpen: (state, toggleId: string) => state.openIds.has(toggleId),
    someClosed: (state, toggleIds: string[]) =>
      toggleIds.some((id) => !state.openIds.has(id)),
  },
}));

export type BaseToggleDefinition = DefinitionOf<typeof BaseTogglePlugin>;
