import { createBasePlateEditor, createEditorPlugin } from '../../lib';
import { getRenderNodeStaticProps } from './getRenderNodeStaticProps';

describe('getRenderNodeStaticProps', () => {
  it('merges plugin props, allowed attrs, slate classes, and injected node props', () => {
    const ParagraphPlugin = createEditorPlugin({
      key: 'p',
      node: {
        dangerouslyAllowAttributes: ['target'],
        isElement: true,
        props: ({ editor }) => ({
          'data-has-editor': editor ? 'yes' : 'no',
          title: undefined,
        }),
        type: 'p',
      },
    });
    const AlignPlugin = createEditorPlugin({
      key: 'align',
      inject: {
        nodeProps: {
          nodeKey: 'align',
          styleKey: 'textAlign',
          targetPlugins: ['p'],
        },
      },
    });
    const editor = createBasePlateEditor({
      plugins: [ParagraphPlugin, AlignPlugin],
      value: [
        {
          align: 'center',
          children: [{ text: 'hello' }],
          type: 'p',
        },
      ],
    });
    const element = editor.children[0] as any;

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
      } as any,
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
    expect(result.attributes?.className).toContain('user-class');
    expect(result.attributes?.className).toContain('plite-align-center');
  });

  it('falls back to editor context and removes empty top-level style objects', () => {
    const editor = createBasePlateEditor();

    const result = getRenderNodeStaticProps({
      editor,
      props: {
        attributes: {},
        children: null,
        style: {},
        text: { text: 'hello' },
      } as any,
    });

    expect(result.api).toBe(editor.api);
    expect(result.editor).toBe(editor);
    expect(result).not.toHaveProperty('tf');
    expect(result.style).toBeUndefined();
  });
});
