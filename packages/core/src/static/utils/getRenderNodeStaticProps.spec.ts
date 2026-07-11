import { ElementApi } from '@platejs/plite';

import { createBaseEditor, createBasePlugin } from '../../lib';
import { getRenderNodeStaticProps } from './getRenderNodeStaticProps';

describe('getRenderNodeStaticProps', () => {
  it('merges plugin props, allowed attrs, slate classes, and injected node props', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      node: {
        dangerouslyAllowAttributes: ['target'],
        isElement: true,
        props: ({ editor }) => ({
          className: 'plugin-class',
          'data-has-editor': editor ? 'yes' : 'no',
          title: undefined,
        }),
        type: 'p',
      },
    });
    const AlignPlugin = createBasePlugin({
      key: 'align',
      inject: {
        nodeProps: {
          nodeKey: 'align',
          styleKey: 'textAlign',
          targetPlugins: ['p'],
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, AlignPlugin],
      value: [
        {
          align: 'center',
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
      attributes: {
        'data-plite-align': 'center',
        ignored: 'nope',
        target: '_blank',
      },
      editor,
      node: element,
      plugin: editor.getPlugin(ParagraphPlugin),
      props: {
        attributes: {},
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
