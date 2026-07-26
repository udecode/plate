import { createBasePlugin, createRuleFactory } from '@platejs/core';

const ListInputRulePlugin = createBasePlugin({
  key: 'listInputRule',
  update: () => ({
    toggle: (style: 'decimal' | 'disc') => style,
  }),
});

const createListInputRule = createRuleFactory(ListInputRulePlugin);

createListInputRule({
  type: 'blockStart',
  apply: ({ tx }) => {
    const style: 'decimal' | 'disc' = tx.listInputRule.toggle('disc');

    void style;

    // @ts-expect-error Plugin-bound input rules expose only installed tx groups.
    tx.missingInputRule.toggle();
  },
  match: '-',
  trigger: ' ',
});
