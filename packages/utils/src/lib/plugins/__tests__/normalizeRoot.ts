import { type AnyBasePlugin, createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { type Selection, type Value, schema } from '@platejs/plite';

export const fixtureSchemaPlugins = [
  createBasePlugin({
    key: 'fixtureH1',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    type: 'h1',
  }),
  createBasePlugin({
    key: 'fixtureH2',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    type: 'h2',
  }),
  createBasePlugin({
    key: 'fixtureElement',
    schema: ({ plugins }) => ({
      element: {
        content: plugins.blockContent(),
      },
    }),
    type: 'element',
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
