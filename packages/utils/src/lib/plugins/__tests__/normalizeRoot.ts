import { type AnyBasePlugin, createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { type Selection, type Value, schema } from '@platejs/plite';

export const fixtureSchemaPlugins = [
  createBasePlugin({
    key: 'fixtureH1',
    node: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        groups: ['block'],
      },
      type: 'h1',
    },
  }),
  createBasePlugin({
    key: 'fixtureH2',
    node: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        groups: ['block'],
      },
      type: 'h2',
    },
  }),
  createBasePlugin({
    key: 'fixtureElement',
    node: {
      element: {
        content: schema.content.group('block'),
        groups: ['block'],
      },
      type: 'element',
    },
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
    ...(value.length > 0 ? { value } : {}),
  });

  if (value.length === 0) {
    editor.update.value.replace({ children: [] });
  }

  editor.update.value.repair();

  return {
    children: editor.read.children(),
  };
};
