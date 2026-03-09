import { BoldPlugin } from '@platejs/basic-nodes/react';

import { createSlateEditor } from '../../../editor';
import { type HtmlDeserializer, createSlatePlugin } from '../../../plugin';
import { BaseParagraphPlugin } from '../../paragraph';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

const parse = () => ({ type: BaseParagraphPlugin.key });

describe('when element is p and validNodeName is P', () => {
  it('returns a paragraph node', () => {
    const deserializer: HtmlDeserializer = {
      isElement: true,
      parse,
      rules: [
        {
          validNodeName: 'P',
        },
      ],
    };

    expect(
      pluginDeserializeHtml(
        createSlateEditor(),
        createSlatePlugin({
          node: { type: BaseParagraphPlugin.key },
          parsers: {
            html: {
              deserializer,
            },
          },
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
      pluginDeserializeHtml(
        createSlateEditor(),
        createSlatePlugin({
          node: { type: BaseParagraphPlugin.key },
          parsers: {
            html: {
              deserializer: {
                isElement: true,
                parse,
                rules: [
                  {
                    validAttribute: { title: '' },
                  },
                ],
              },
            },
          },
        }),
        { element }
      )?.node
    ).toEqual(parse());
  });

  it('doesnt return p type with an unset attribute', () => {
    const element = document.createElement('p');

    expect(
      pluginDeserializeHtml(
        createSlateEditor(),
        createSlatePlugin({
          node: { type: BaseParagraphPlugin.key },
          parsers: {
            html: {
              deserializer: {
                isElement: true,
                parse,
                rules: [
                  {
                    validAttribute: { title: '' },
                  },
                ],
              },
            },
          },
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
      pluginDeserializeHtml(
        createSlateEditor(),
        createSlatePlugin({
          node: { type: BaseParagraphPlugin.key },
          parsers: {
            html: {
              deserializer: {
                isElement: true,
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
      pluginDeserializeHtml(
        createSlateEditor(),
        createSlatePlugin({
          node: { type: BaseParagraphPlugin.key },
          parsers: {
            html: {
              deserializer: {
                isElement: true,
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
      pluginDeserializeHtml(
        createSlateEditor(),
        createSlatePlugin({
          node: { type: BaseParagraphPlugin.key },
          parsers: {
            html: {
              deserializer: {
                isElement: true,
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
      pluginDeserializeHtml(
        createSlateEditor(),
        createSlatePlugin({
          node: { isLeaf: true, type: BoldPlugin.key },
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
        }),
        { deserializeLeaf: true, element: el }
      )?.node
    ).toEqual({ [BoldPlugin.key]: true });
  });
});
