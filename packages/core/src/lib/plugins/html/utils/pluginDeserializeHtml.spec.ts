import { property, schema } from '@platejs/plite';

import { createBaseEditor, createBasePlugin } from '../../../index';
import { parseHtmlElement } from './parseHtmlElement';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

const paragraphElement = {
  content: schema.content.text({ default: 'text', min: 1 }),
} as const;

describe('pluginDeserializeHtml', () => {
  it('adds static rules and merges parsed, injected, data, and allowed attribute props', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            attributeNames: ['data-id'],
            parse: () => ({ type: 'p' }),
          },
        },
      },
    });
    const AlignPlugin = createBasePlugin({
      key: 'align',
      inject: {
        parsers: {
          p: {
            parsers: {
              html: {
                deserializer: {
                  parse: () => ({ align: 'center' }),
                },
              },
            },
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, AlignPlugin],
    });
    const element = parseHtmlElement(
      '<p class="plite-p" data-plite-level="3" data-id="abc"></p>'
    );

    const result = pluginDeserializeHtml(
      editor,
      editor.getPlugin(ParagraphPlugin),
      {
        element,
      }
    );

    expect(result?.rules?.[0]).toEqual({
      validClassName: 'plite-p',
      validNodeName: '*',
    });
    expect(result?.node).toEqual({
      align: 'center',
      attributes: { 'data-id': 'abc' },
      level: 3,
      type: 'p',
    });
  });

  it('skips parser output for existing plite nodes and keeps only data-node props', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            parse: () => ({ type: 'p' }),
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });
    const element = parseHtmlElement(
      '<p class="plite-p" data-plite-node="element" data-plite-level="2"></p>'
    );

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(ParagraphPlugin), {
        element,
      })?.node
    ).toEqual({
      level: 2,
    });
  });

  it('rejects styles that only restate the injected default node value', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      inject: {
        nodeProps: {
          defaultNodeValue: '1.5',
        },
      },
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            parse: () => ({ type: 'p' }),
            rules: [
              {
                validClassName: 'plite-p',
                validNodeName: 'P',
                validStyle: { lineHeight: '*' },
              },
            ],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });
    const element = parseHtmlElement(
      '<p class="plite-p" style="line-height: 1.5"></p>'
    );

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(ParagraphPlugin), {
        element,
      })
    ).toBeUndefined();
  });

  it('falls back to a boolean leaf mark when parse is omitted', () => {
    const BoldPlugin = createBasePlugin({
      key: 'bold',
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
      parsers: {
        html: {
          deserializer: {
            rules: [{ validNodeName: 'STRONG' }],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [BoldPlugin],
    });
    const element = parseHtmlElement('<strong class="plite-bold"></strong>');

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(BoldPlugin), {
        deserializeLeaf: true,
        element,
      })?.node
    ).toEqual({
      bold: true,
    });
  });

  it('matches string attribute rules and stores allowed attributes', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            attributeNames: ['data-kind'],
            rules: [{ validAttribute: 'data-kind', validNodeName: 'P' }],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });
    const element = parseHtmlElement(
      '<p class="plite-p" data-kind="todo"></p>'
    );

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(ParagraphPlugin), {
        element,
      })?.node
    ).toEqual({
      attributes: { 'data-kind': 'todo' },
      type: 'p',
    });
  });

  it('rejects string attribute rules when the required attribute is missing', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            rules: [{ validAttribute: 'data-kind', validNodeName: 'P' }],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(ParagraphPlugin), {
        element: parseHtmlElement('<p></p>'),
      })
    ).toBeUndefined();
  });

  it('rejects object attribute rules when the element value does not match', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            rules: [
              {
                validAttribute: { 'data-kind': 'todo' },
                validNodeName: 'P',
              },
            ],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });
    const element = parseHtmlElement('<p data-kind="done"></p>');

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(ParagraphPlugin), {
        element,
      })
    ).toBeUndefined();
  });

  it('returns undefined when the deserializer query rejects the element', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            query: () => false,
            rules: [{ validNodeName: 'P' }],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(ParagraphPlugin), {
        element: parseHtmlElement('<p class="plite-p"></p>'),
      })
    ).toBeUndefined();
  });

  it('returns undefined when parse is omitted for a non-element, non-leaf plugin', () => {
    const UnknownPlugin = createBasePlugin({
      key: 'unknown',
      parsers: {
        html: {
          deserializer: {
            rules: [{ validNodeName: 'DIV' }],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [UnknownPlugin],
    });

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(UnknownPlugin), {
        element: parseHtmlElement('<div class="plite-unknown"></div>'),
      })
    ).toBeUndefined();
  });

  it('matches valid style arrays and falls back to the element type when parse is omitted', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            rules: [
              {
                validNodeName: 'P',
                validStyle: {
                  textAlign: ['center', 'right'],
                },
              },
            ],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(ParagraphPlugin), {
        element: parseHtmlElement(
          '<p class="plite-p" style="text-align: center"></p>'
        ),
      })?.node
    ).toEqual({
      type: 'p',
    });
  });

  it('matches object attribute rules when the attribute value is in the allowed list', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: { element: paragraphElement },
      parsers: {
        html: {
          deserializer: {
            attributeNames: ['data-kind'],
            rules: [
              {
                validAttribute: { 'data-kind': ['todo', 'done'] },
                validNodeName: 'P',
              },
            ],
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });

    expect(
      pluginDeserializeHtml(editor, editor.getPlugin(ParagraphPlugin), {
        element: parseHtmlElement('<p class="plite-p" data-kind="done"></p>'),
      })?.node
    ).toEqual({
      attributes: { 'data-kind': 'done' },
      type: 'p',
    });
  });
});
