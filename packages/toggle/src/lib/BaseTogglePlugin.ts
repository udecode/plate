import { defineBasePlugin, type DefinitionOf } from '@platejs/core';
import { ElementApi, type NodeKey, schema } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export type BaseTogglePluginState = {
  openKeys: Set<NodeKey>;
  toggleIndex: Map<NodeKey, NodeKey[]>;
};

export const BaseTogglePlugin = defineBasePlugin(PLUGINS.toggle, {
  initialState: (): BaseTogglePluginState => ({
    openKeys: new Set(),
    toggleIndex: new Map(),
  }),
  schema: { element: schema.element.textBlock() },
}).extend(({ store, schema: { type } }) => ({
  api: () => ({
    toggleKeys: (keys: NodeKey[], force: boolean | null = null) => {
      store.set((draft) => {
        if (!draft.openKeys) draft.openKeys = new Set();

        const { openKeys } = draft;

        keys.forEach((key) => {
          const isOpen = openKeys.has(key);
          const nextOpen = force === null ? !isOpen : force;

          if (nextOpen) {
            openKeys.add(key);
          } else {
            openKeys.delete(key);
          }
        });
      });
    },
  }),
  read: ({ state }) => ({
    lastEnclosedEntry: (toggleKey: NodeKey) => {
      const togglePath = state.nodes.path(toggleKey);

      if (!togglePath || togglePath.length !== 1) return;
      let inside = false;
      let last:
        | readonly [ReturnType<typeof state.children>[number], number[]]
        | undefined;
      let toggleIndent = 0;

      state.children().forEach((node, index) => {
        if (!ElementApi.isElement(node)) return;

        const indentValue = node.indent;
        const indent = typeof indentValue === 'number' ? indentValue : 0;
        const adjustedIndent =
          node.listStyleType && indent ? indent - 1 : indent;

        if (index === togglePath[0] && node.type === type) {
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
    enclosingKeys: (state, elementKey: NodeKey) =>
      state.toggleIndex.get(elementKey) ?? [],
    isClosed: (state, elementKey: NodeKey) =>
      (state.toggleIndex.get(elementKey) ?? []).some(
        (toggleKey) => !state.openKeys.has(toggleKey)
      ),
    isOpen: (state, toggleKey: NodeKey) => state.openKeys.has(toggleKey),
    someClosed: (state, toggleKeys: NodeKey[]) =>
      toggleKeys.some((key) => !state.openKeys.has(key)),
  },
}));

export type BaseToggleDefinition = DefinitionOf<typeof BaseTogglePlugin>;
