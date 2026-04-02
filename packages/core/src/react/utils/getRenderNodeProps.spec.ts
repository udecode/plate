import { createSlatePlugin } from '../../lib';
import { createPlateEditor } from '../editor/withPlate';
import { getRenderNodeProps } from './getRenderNodeProps';

describe('getRenderNodeProps', () => {
  it('keeps plain paragraph class merging on the fast path', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: [
        {
          children: [{ text: 'hello' }],
          type: 'p',
        },
      ],
    });
    const element = editor.children[0] as any;

    const result = getRenderNodeProps({
      editor,
      plugin: editor.getPlugin({ key: 'p' }) as any,
      props: {
        attributes: {
          className: 'attr-class',
          style: {},
        },
        children: null,
        className: 'user-class',
        element,
      } as any,
      readOnly: false,
    });

    expect(result.api).toBe(editor.api);
    expect(result.editor).toBe(editor);
    expect(result.tf).toBe(editor.transforms);
    expect(result.attributes?.className).toContain('slate-p');
    expect(result.attributes?.className).toContain('attr-class');
    expect(result.attributes?.className).toContain('user-class');
    expect(result.attributes?.style).toBeUndefined();
  });

  it('keeps plugin props, allowed attrs, and injected node props on the full path', () => {
    const ParagraphPlugin = createSlatePlugin({
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
    const AlignPlugin = createSlatePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'align',
          styleKey: 'textAlign',
          targetPlugins: ['p'],
        },
      },
      key: 'align',
    });
    const editor = createPlateEditor({
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

    const result = getRenderNodeProps({
      attributes: {
        'data-slate-align': 'center',
        ignored: 'nope',
        target: '_blank',
      },
      editor,
      plugin: editor.getPlugin(ParagraphPlugin),
      props: {
        attributes: {},
        children: null,
        className: 'user-class',
        element,
      } as any,
      readOnly: false,
    });

    expect(result.attributes).toMatchObject({
      'data-has-editor': 'yes',
      style: { textAlign: 'center' },
      target: '_blank',
    });
    expect(result.attributes?.ignored).toBeUndefined();
    expect(result.attributes?.title).toBeUndefined();
    expect(result.attributes?.className).toContain('slate-p');
    expect(result.attributes?.className).toContain('user-class');
    expect(result.attributes?.className).toContain('slate-align-center');
  });
});
