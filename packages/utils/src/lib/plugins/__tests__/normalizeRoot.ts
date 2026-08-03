import { defineBasePlugin } from '@platejs/core';
import type { AnyBasePlugin } from '@platejs/core/internal';
import { createPlateEditor } from '@platejs/core/react';
import { type Selection, type Value, schema } from '@platejs/plite';

export const fixtureSchemaPlugins = [
  defineBasePlugin('h1', {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  }),
  defineBasePlugin('h2', {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  }),
  defineBasePlugin('element', {
    schema: ({ plugins }) => ({
      element: {
        content: plugins.blockContent(),
      },
    }),
  }),
];

export const normalizeRoot = ({
  plugins,
  selection,
  value,
}: {
  plugins: AnyBasePlugin[];
  selection?: Selection;
  value: Value;
}) => {
  const editor = createPlateEditor({
    plugins: [...fixtureSchemaPlugins, ...plugins],
    selection,
    ...(value.length > 0 ? { initialValue: value } : {}),
  });

  if (value.length === 0) {
    editor.update.value.replace({ children: [] });
  }

  editor.update.value.repair();

  return {
    children: editor.read.children(),
  };
};
