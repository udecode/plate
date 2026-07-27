import { createBasePlugin, type InferConfig } from '@platejs/core';
import { ElementApi, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseTogglePlugin = createBasePlugin({
  api: ({ store }) => ({
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
  key: KEYS.toggle,
  initialState: {
    openIds: new Set<string>(),
  },
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  read: ({ state, type }) => ({
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
    isOpen: (state, toggleId: string) => state.openIds.has(toggleId),
    someClosed: (state, toggleIds: string[]) =>
      toggleIds.some((id) => !state.openIds.has(id)),
  },
});

export type BaseToggleConfig = InferConfig<typeof BaseTogglePlugin>;
