import { BoldPlugin } from '@platejs/basic-nodes/react';
import { property, schema } from '@platejs/plite';

import { createBaseEditor } from '../../../../../../packages/core/src/lib/editor';
import {
  type HtmlDeserializer,
  createBasePlugin,
} from '../../../../../../packages/core/src/lib/plugin';
import { BaseParagraphPlugin } from '../../../../../../packages/core/src/lib/plugins/paragraph';
import { pluginDeserializeHtml } from '../../../../../../packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml';

const parse = () => ({ type: BaseParagraphPlugin.key });

const paragraphElement = {
  content: schema.content.text({ default: 'text', min: 1 }),
} as const;

const deserializeWithPlugin = (
  plugin: Parameters<typeof pluginDeserializeHtml>[1],
  options: Parameters<typeof pluginDeserializeHtml>[2]
) => {
  const editor = createBaseEditor({
    plugins: [plugin],
  });

  return pluginDeserializeHtml(editor, editor.getPlugin(plugin), options);
};

describe('when element is p and validNodeName is P', () => {
  it('returns a paragraph node', () => {
    const deserializer: HtmlDeserializer = {
      parse,
      rules: [
        {
          validNodeName: 'P',
        },
      ],
    };

    expect(
      deserializeWithPlugin(
        createBasePlugin({
          key: BaseParagraphPlugin.key,
          parsers: {
            html: {
              deserializer,
            },
          },
          schema: { element: paragraphElement },
          type: BaseParagraphPlugin.key,
        }),
        { element: document.createElement('p') }
      )?.node
    ).toEqual(parse());
  });
});

describe('when element is p, validAttribute', () => {
  it('returns p type with an existing attribute', () => {
    const element = document.createElement('p');
    element.setAttribute('title', '');

    expect(
      deserializeWithPlugin(
        createBasePlugin({
          key: BaseParagraphPlugin.key,
          parsers: {
            html: {
              deserializer: {
                parse,
                rules: [
                  {
                    validAttribute: { title: '' },
                  },
                ],
              },
            },
          },
          schema: { element: paragraphElement },
          type: BaseParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).toEqual(parse());
  });

  it('doesnt return p type with an unset attribute', () => {
    const element = document.createElement('p');

    expect(
      deserializeWithPlugin(
        createBasePlugin({
          key: BaseParagraphPlugin.key,
          parsers: {
            html: {
              deserializer: {
                parse,
                rules: [
                  {
                    validAttribute: { title: '' },
                  },
                ],
              },
            },
          },
          schema: { element: paragraphElement },
          type: BaseParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).not.toEqual(parse());
  });
});

describe('when element is p with color and rule style is different', () => {
  it('does not return a paragraph node', () => {
    const element = document.createElement('p');
    element.style.color = '#FF0000';

    expect(
      deserializeWithPlugin(
        createBasePlugin({
          key: BaseParagraphPlugin.key,
          parsers: {
            html: {
              deserializer: {
                parse,
                rules: [
                  {
                    validStyle: {
                      color: '#333',
                    },
                  },
                ],
              },
            },
          },
          schema: { element: paragraphElement },
          type: BaseParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).not.toEqual(parse());
  });
});

describe('when element is p with same style color than rule', () => {
  it('matches an exact style rule', () => {
    const element = document.createElement('p');
    element.style.color = 'rgb(255, 0, 0)';

    expect(
      deserializeWithPlugin(
        createBasePlugin({
          key: BaseParagraphPlugin.key,
          parsers: {
            html: {
              deserializer: {
                parse,
                rules: [
                  {
                    validStyle: {
                      color: 'rgb(255, 0, 0)',
                    },
                  },
                ],
              },
            },
          },
          schema: { element: paragraphElement },
          type: BaseParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).toEqual(parse());
  });
});

describe('when element has style color and rule style color is *', () => {
  it('matches wildcard style rules', () => {
    const element = document.createElement('p');
    element.style.color = '#FF0000';

    expect(
      deserializeWithPlugin(
        createBasePlugin({
          key: BaseParagraphPlugin.key,
          parsers: {
            html: {
              deserializer: {
                parse,
                rules: [
                  {
                    validStyle: {
                      color: '*',
                    },
                  },
                ],
              },
            },
          },
          schema: { element: paragraphElement },
          type: BaseParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).toEqual(parse());
  });
});

describe('when element is strong and validNodeName is strong', () => {
  it('returns the matching leaf mark', () => {
    const el = document.createElement('strong');
    el.textContent = 'hello';

    expect(
      deserializeWithPlugin(
        createBasePlugin({
          key: BoldPlugin.key,
          parsers: {
            html: {
              deserializer: {
                rules: [
                  {
                    validNodeName: 'STRONG',
                  },
                ],
              },
            },
          },
          schema: {
            mark: property.boolean({ default: false, omitDefault: true }),
          },
        }),
        { deserializeLeaf: true, element: el }
      )?.node
    ).toEqual({ [BoldPlugin.key]: true });
  });
});
