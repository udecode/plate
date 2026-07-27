import { createBasePlugin, createRuleFactory } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, type TScriptValue } from '@platejs/utils';

export const ScriptRules = {
  markdown: createRuleFactory<{ value: TScriptValue }>({
    type: 'mark',
    start: ({ value }) => (value === 'sub' ? '~' : '^'),
    trigger: ({ value }) => (value === 'sub' ? '~' : '^'),
    value: ({ value }) => value,
  }),
};

/** Enables subscript and superscript through one enum-valued mark. */
export const BaseScriptPlugin = createBasePlugin({
  key: KEYS.script,
  schema: {
    mark: property.enum(['sub', 'sup']),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          element.tagName === 'SUB' || element.style.verticalAlign === 'sub'
            ? 'sub'
            : 'sup',
        encode: ({ value }) => {
          if (value === 'sub') return { tag: 'sub' };
          if (value === 'sup') return { tag: 'sup' };

          return null;
        },
        match: [
          { tag: 'sub' },
          { tag: 'sup' },
          { style: { verticalAlign: 'sub' } },
          { style: { verticalAlign: 'super' } },
        ],
      },
    }),
  rules: { selection: { affinity: 'directional' } },
  update: ({ tx, type }) => ({
    toggle: (value: TScriptValue) => {
      tx.marks.toggle(type, value);
    },
  }),
});
