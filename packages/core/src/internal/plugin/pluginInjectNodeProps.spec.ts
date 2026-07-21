import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { pluginInjectNodeProps } from './pluginInjectNodeProps';

describe('pluginInjectNodeProps', () => {
  it('returns default class and style props for matching elements', () => {
    const AlignPlugin = createBasePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'align',
          styleKey: 'textAlign',
        },
      },
      key: 'align',
    });

    const editor = createBaseEditor({
      plugins: [AlignPlugin],
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
          },
        },
        () => [0]
      )
    ).toEqual({
      className: 'plite-align-center',
      style: {
        textAlign: 'center',
      },
    });
  });

  it('returns undefined when the query fails or the node is missing', () => {
    const BoldPlugin = createBasePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'bold',
          query: () => false,
        },
      },
      key: 'bold',
    });

    const editor = createBaseEditor({
      plugins: [BoldPlugin],
    });

    expect(
      pluginInjectNodeProps(editor, editor.getPlugin(BoldPlugin), {}, () => [0])
    ).toBeUndefined();
    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(BoldPlugin),
        { text: { bold: true, text: 'hello' } },
        () => [0]
      )
    ).toBeUndefined();
  });

  it('keeps transformProps hook order when inject matching rejects the node', () => {
    const transformProps = mock(({ props }) => props);
    const TargetPlugin = createBasePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'tone',
          transformProps,
        },
        targetPlugins: ['quote'],
      },
      key: 'target',
    });

    const editor = createBaseEditor({
      plugins: [TargetPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(TargetPlugin),
        {
          element: {
            children: [{ text: 'hello' }],
            tone: 'red',
            type: 'p',
          },
        },
        () => [0]
      )
    ).toBeUndefined();

    expect(transformProps).toHaveBeenCalledTimes(1);
    expect(transformProps.mock.calls[0]?.[0].props).toEqual({});
  });

  it('keeps transformProps hook order when the query rejects the node', () => {
    const transformProps = mock(({ props }) => props);
    const QueryPlugin = createBasePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'tone',
          query: () => false,
          transformProps,
        },
      },
      key: 'query',
    });

    const editor = createBaseEditor({
      plugins: [QueryPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(QueryPlugin),
        { text: { text: 'hello', tone: 'red' } },
        () => [0]
      )
    ).toBeUndefined();

    expect(transformProps).toHaveBeenCalledTimes(1);
    expect(transformProps.mock.calls[0]?.[0].props).toEqual({});
  });

  it('suppresses default node values unless transformProps forces an injection', () => {
    const ForcedPlugin = createBasePlugin({
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
    const SilentPlugin = createBasePlugin({
      inject: {
        nodeProps: {
          defaultNodeValue: false,
          nodeKey: 'bold',
        },
      },
      key: 'silent',
    });

    const editor = createBaseEditor({
      plugins: [ForcedPlugin, SilentPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(SilentPlugin),
        { text: { bold: false, text: 'hello' } },
        () => [0]
      )
    ).toBeUndefined();
    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(ForcedPlugin),
        { text: { bold: false, text: 'hello' } },
        () => [0]
      )
    ).toEqual({
      'data-forced': 'yes',
    });
  });

  it('uses transform callbacks in precedence order', () => {
    const TonePlugin = createBasePlugin({
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

    const editor = createBaseEditor({
      plugins: [TonePlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(TonePlugin),
        { text: { text: 'hello', tone: 'red' } },
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
    const ListishPlugin = createBasePlugin({
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
        targetPlugins: ['p'],
      },
      key: 'list',
    });

    const editor = createBaseEditor({
      plugins: [ListishPlugin],
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
          },
        },
        getPath
      )
    ).toEqual({
      className: 'plite-listStyleType-disc',
      style: {
        listStyleType: 'disc',
      },
    });

    expect(getPath).not.toHaveBeenCalled();
  });

  it('does not resolve a path for inject matching when the plugin has no path-based filters', () => {
    const PathlessPlugin = createBasePlugin({
      inject: {
        nodeProps: {
          styleKey: '',
          transformProps: ({ props }) => props,
        },
      },
      key: 'pathless',
    });

    const editor = createBaseEditor({
      plugins: [PathlessPlugin],
    });
    const getPath = mock(() => [0]);

    pluginInjectNodeProps(
      editor,
      editor.getPlugin(PathlessPlugin),
      { text: { text: 'hello' } },
      getPath
    );

    expect(getPath).not.toHaveBeenCalled();
  });

  it('skips path-based injection when the live node no longer resolves', () => {
    const transformProps = mock(({ props }) => props);
    const PathPlugin = createBasePlugin({
      inject: {
        excludeBelowPlugins: ['quote'],
        nodeProps: {
          nodeKey: 'tone',
          transformProps,
        },
      },
      key: 'path',
    });
    const editor = createBaseEditor({ plugins: [PathPlugin] });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.getPlugin(PathPlugin),
        { text: { text: 'hello', tone: 'red' } },
        () => undefined
      )
    ).toBeUndefined();

    expect(transformProps).toHaveBeenCalledTimes(1);
    expect(transformProps.mock.calls[0]?.[0].props).toEqual({});
  });
});
