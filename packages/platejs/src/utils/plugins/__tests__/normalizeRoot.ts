import { type AnyBasePlugin, defineBasePlugin } from 'platejs';
import { createEditor } from 'platejs/react';
import { type Selection, type Value, schema } from 'plitejs';

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
  const editor = createEditor({
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
