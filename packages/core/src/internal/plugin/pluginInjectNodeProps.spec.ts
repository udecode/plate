import { createSlateEditor } from '../../lib/editor';
import { createSlatePlugin } from '../../lib/plugin';
import { pluginInjectNodeProps } from './pluginInjectNodeProps';

describe('pluginInjectNodeProps', () => {
  it('returns default class and style props for matching elements', () => {
    const AlignPlugin = createSlatePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'align',
          styleKey: 'textAlign',
        },
      },
      key: 'align',
    });

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'paragraph',
          node: { isElement: true, type: 'p' },
        }),
        AlignPlugin,
      ],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(AlignPlugin),
        {
          element: {
            align: 'center',
            children: [{ text: 'hello' }],
            type: 'p',
          } as any,
        },
        () => [0]
      )
    ).toEqual({
      className: 'slate-align-center',
      style: {
        textAlign: 'center',
      },
    });
  });

  it('returns undefined when the query fails or the node is missing', () => {
    const BoldPlugin = createSlatePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'bold',
          query: () => false,
        },
      },
      key: 'bold',
    });

    const editor = createSlateEditor({
      plugins: [BoldPlugin],
    });

    expect(
      pluginInjectNodeProps(editor, editor.getPlugin(BoldPlugin), {}, () => [0])
    ).toBeUndefined();
    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(BoldPlugin),
        { text: { bold: true, text: 'hello' } as any },
        () => [0]
      )
    ).toBeUndefined();
  });

  it('suppresses default node values unless transformProps forces an injection', () => {
    const ForcedPlugin = createSlatePlugin({
      inject: {
        nodeProps: {
          defaultNodeValue: false,
          nodeKey: 'bold',
          styleKey: '',
          transformProps: ({ props }) => ({
            ...props,
            'data-forced': 'yes',
          }),
        },
      },
      key: 'forced',
    });
    const SilentPlugin = createSlatePlugin({
      inject: {
        nodeProps: {
          defaultNodeValue: false,
          nodeKey: 'bold',
        },
      },
      key: 'silent',
    });

    const editor = createSlateEditor({
      plugins: [ForcedPlugin, SilentPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(SilentPlugin),
        { text: { bold: false, text: 'hello' } as any },
        () => [0]
      )
    ).toBeUndefined();
    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(ForcedPlugin),
        { text: { bold: false, text: 'hello' } as any },
        () => [0]
      )
    ).toEqual({
      'data-forced': 'yes',
    });
  });

  it('uses transform callbacks in precedence order', () => {
    const TonePlugin = createSlatePlugin({
      inject: {
        nodeProps: {
          classNames: {
            red: 'tone-red',
          },
          nodeKey: 'tone',
          styleKey: 'color',
          transformClassName: ({ value }) => `tone-${value}`,
          transformNodeValue: ({ nodeValue }) => nodeValue.toUpperCase(),
          transformProps: ({ props, value }) => ({
            ...props,
            'data-tone': value,
          }),
          transformStyle: ({ value }) => ({ color: value }),
        },
      },
      key: 'tone',
    });

    const editor = createSlateEditor({
      plugins: [TonePlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(TonePlugin),
        { text: { text: 'hello', tone: 'red' } as any },
        () => [0]
      )
    ).toEqual({
      'data-tone': 'RED',
      className: 'tone-RED',
      style: {
        color: 'RED',
      },
    });
  });

  it('does not resolve a path when inject matching is pathless', () => {
    const ListishPlugin = createSlatePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'listStyleType',
          query: ({ nodeProps }) => !!nodeProps.element?.listStyleType,
          transformProps: ({ props, value }) => ({
            ...props,
            style: {
              ...props.style,
              listStyleType: value,
            },
          }),
        },
        targetPlugins: ['paragraph'],
      },
      key: 'list',
    });

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'paragraph',
          node: { isElement: true, type: 'p' },
        }),
        ListishPlugin,
      ],
    });

    const getPath = mock(() => {
      throw new Error('path lookup should be skipped');
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(ListishPlugin),
        {
          element: {
            children: [{ text: 'hello' }],
            listStyleType: 'disc',
            type: 'p',
          } as any,
        },
        getPath as any
      )
    ).toEqual({
      className: 'slate-listStyleType-disc',
      style: {
        listStyleType: 'disc',
      },
    });

    expect(getPath).not.toHaveBeenCalled();
  });
});
