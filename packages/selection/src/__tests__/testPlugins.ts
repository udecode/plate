import { createBasePlugin } from '@platejs/core';
import { property, schema, type SchemaContent, target } from '@platejs/plite';

const createTestContainerPlugin = <const TKey extends string>(
  key: TKey,
  content: SchemaContent,
  { rootCapable = false }: { rootCapable?: boolean } = {}
) =>
  createBasePlugin({
    key,
    node: {
      element: {
        content,
        ...(rootCapable ? { groups: ['block'] } : {}),
      },
    },
  });

const blockContent = schema.content.group('block', {
  default: { type: 'p' },
  min: 1,
});

export const TestBoldPlugin = createBasePlugin({
  key: 'bold',
  node: { mark: true },
});

export const TestElementPropertiesPlugin = createBasePlugin({
  key: 'testElementProperties',
  schema: {
    properties: [
      schema.elementProperty('align', property.string(), {
        target: target.group('element'),
      }),
      schema.elementProperty('indent', property.number(), {
        target: target.group('element'),
      }),
      schema.elementProperty('variant', property.string(), {
        target: target.group('element'),
      }),
    ],
  },
});

export const TestColumnGroupPlugin = createTestContainerPlugin(
  'column_group',
  schema.content.type('column', { default: { type: 'column' }, min: 1 }),
  { rootCapable: true }
);
export const TestColumnPlugin = createTestContainerPlugin(
  'column',
  blockContent
);
export const TestDivPlugin = createTestContainerPlugin('div', blockContent, {
  rootCapable: true,
});
export const TestRootPlugin = createTestContainerPlugin(
  'root',
  schema.content.type('section', { default: { type: 'section' }, min: 1 }),
  { rootCapable: true }
);
export const TestSectionPlugin = createTestContainerPlugin(
  'section',
  schema.content.type('div', { default: { type: 'div' }, min: 1 })
);
export const TestTableCellPlugin = createTestContainerPlugin(
  'td',
  blockContent
);
export const TestTablePlugin = createTestContainerPlugin(
  'table',
  schema.content.type('tr', { default: { type: 'tr' }, min: 1 }),
  { rootCapable: true }
);
export const TestTableRowPlugin = createTestContainerPlugin(
  'tr',
  schema.content.type('td', { default: { type: 'td' }, min: 1 })
);
