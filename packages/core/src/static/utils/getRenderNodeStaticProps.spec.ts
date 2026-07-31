import { ElementApi, property, schema, target } from '@platejs/plite';

import { createBaseEditor, createBasePlugin } from '../../lib';
import { getRenderNodeStaticProps } from './getRenderNodeStaticProps';

describe('getRenderNodeStaticProps', () => {
  it('merges plugin props, allowed attrs, Plite classes, and injected node props', () => {
    const ParagraphPlugin = createBasePlugin({
      name: 'p',
      type: 'p',
      schema: {
        element: {
          content: schema.content.open({ default: 'text', min: 1 }),
          properties: { attributes: property.json() },
        },
      },
      render: {
        nodeProps: ({ editor, element }) => {
          const target =
            typeof element.attributes === 'object' &&
            element.attributes !== null &&
            !Array.isArray(element.attributes)
              ? Reflect.get(element.attributes, 'target')
              : undefined;

          return {
            className: 'plugin-class',
            'data-has-editor': editor ? 'yes' : 'no',
            target: typeof target === 'string' ? target : undefined,
            title: undefined,
          };
        },
      },
    });
    const AlignPlugin = createBasePlugin({
      targetPluginNames: ['p'],
      name: 'align',
      schema: {
        properties: [
          schema.elementProperty('align', property.string(), {
            target: target.type('p'),
          }),
        ],
      },
      inject: {
        nodeProps: {
          nodeKey: 'align',
          styleKey: 'textAlign',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, AlignPlugin],
      initialValue: [
        {
          align: 'center',
          attributes: { ignored: 'nope', target: '_blank' },
          children: [{ text: 'hello' }],
          type: 'p',
        },
      ],
    });
    const element = editor.read.children()[0];

    if (!ElementApi.isElement(element)) {
      throw new Error('expected element fixture');
    }

    const result = getRenderNodeStaticProps({
      editor,
      plugin: editor.plugin(ParagraphPlugin).plugin,
      props: {
        attributes: { 'data-plite-align': 'center' },
        children: null,
        className: 'user-class',
        element,
      },
    });

    expect(result.attributes).toMatchObject({
      'data-has-editor': 'yes',
      'data-plite-align': 'center',
      style: { textAlign: 'center' },
      target: '_blank',
    });
    expect(result.attributes?.ignored).toBeUndefined();
    expect(result.attributes?.title).toBeUndefined();
    expect(result.attributes?.className).toContain('plite-p');
    expect(result.attributes?.className).toContain('plugin-class');
    expect(result.attributes?.className).toContain('user-class');
    expect(result.attributes?.className).toContain('plite-align-center');
  });

  it('falls back to editor context and removes empty top-level style objects', () => {
    const editor = createBaseEditor();

    const result = getRenderNodeStaticProps({
      editor,
      props: {
        attributes: {},
        children: null,
        style: {},
        text: { text: 'hello' },
      },
    });

    expect(result.api).toBe(editor.api);
    expect(result.editor).toBe(editor);
    expect(result).not.toHaveProperty('tf');
    expect(result.style).toBeUndefined();
  });
});
