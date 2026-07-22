import {
  BaseParagraphPlugin,
  type PluginReference,
  createBasePlugin,
} from '@platejs/core';
import { property, schema, target } from '@platejs/plite';

const createTestContainerPlugin = <
  const TKey extends string,
  const TChild extends PluginReference,
>(
  key: TKey,
  child: TChild
) =>
  createBasePlugin({
    key,
    schema: ({ plugins }) => {
      const childType = plugins.elementType(child);

      return {
        element: {
          content: schema.content.type(childType, {
            default: { type: childType },
            min: 1,
          }),
        },
      };
    },
  });

const createTestBlockContainerPlugin = <const TKey extends string>(key: TKey) =>
  createBasePlugin({
    key,
    schema: ({ plugins }) => ({
      element: {
        content: plugins.blockContent({
          default: { type: plugins.elementType(BaseParagraphPlugin) },
          min: 1,
        }),
      },
    }),
  });

export const TestBoldPlugin = createBasePlugin({
  key: 'bold',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
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

export const TestColumnPlugin = createTestBlockContainerPlugin('column');
export const TestColumnGroupPlugin = createTestContainerPlugin(
  'column_group',
  TestColumnPlugin
);
export const TestDivPlugin = createTestBlockContainerPlugin('div');
export const TestSectionPlugin = createTestContainerPlugin(
  'section',
  TestDivPlugin
);
export const TestRootPlugin = createTestContainerPlugin(
  'root',
  TestSectionPlugin
);
export const TestTableCellPlugin = createTestBlockContainerPlugin('td');
export const TestTableRowPlugin = createTestContainerPlugin(
  'tr',
  TestTableCellPlugin
);
export const TestTablePlugin = createTestContainerPlugin(
  'table',
  TestTableRowPlugin
);
