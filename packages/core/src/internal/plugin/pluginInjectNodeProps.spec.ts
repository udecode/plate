import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { pluginInjectNodeProps } from './pluginInjectNodeProps';

describe('pluginInjectNodeProps', () => {
  it('returns default class and style props for matching elements', () => {
    const AlignPlugin = createBasePlugin({
      name: 'align',
      inject: {
        nodeProps: {
          nodeKey: 'align',
          styleKey: 'textAlign',
        },
      },
    });

    const editor = createBaseEditor({
      plugins: [AlignPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(AlignPlugin).plugin,
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
      name: 'bold',
      inject: {
        nodeProps: {
          nodeKey: 'bold',
          query: () => false,
        },
      },
    });

    const editor = createBaseEditor({
      plugins: [BoldPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(BoldPlugin).plugin,
        {},
        () => [0]
      )
    ).toBeUndefined();
    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(BoldPlugin).plugin,
        { text: { bold: true, text: 'hello' } },
        () => [0]
      )
    ).toBeUndefined();
  });

  it('keeps transformProps hook order when inject matching rejects the node', () => {
    const transformProps = mock(({ props }) => props);
    const TargetPlugin = createBasePlugin({
      targetPluginNames: ['quote'],
      name: 'target',
      inject: {
        nodeProps: {
          nodeKey: 'tone',
          transformProps,
        },
      },
    });

    const editor = createBaseEditor({
      plugins: [TargetPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(TargetPlugin).plugin,
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
      name: 'query',
      inject: {
        nodeProps: {
          nodeKey: 'tone',
          query: () => false,
          transformProps,
        },
      },
    });

    const editor = createBaseEditor({
      plugins: [QueryPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(QueryPlugin).plugin,
        { text: { text: 'hello', tone: 'red' } },
        () => [0]
      )
    ).toBeUndefined();

    expect(transformProps).toHaveBeenCalledTimes(1);
    expect(transformProps.mock.calls[0]?.[0].props).toEqual({});
  });

  it('suppresses default node values unless transformProps forces an injection', () => {
    const ForcedPlugin = createBasePlugin({
      name: 'forced',
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
    });
    const SilentPlugin = createBasePlugin({
      name: 'silent',
      inject: {
        nodeProps: {
          defaultNodeValue: false,
          nodeKey: 'bold',
        },
      },
    });

    const editor = createBaseEditor({
      plugins: [ForcedPlugin, SilentPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(SilentPlugin).plugin,
        { text: { bold: false, text: 'hello' } },
        () => [0]
      )
    ).toBeUndefined();
    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(ForcedPlugin).plugin,
        { text: { bold: false, text: 'hello' } },
        () => [0]
      )
    ).toEqual({
      'data-forced': 'yes',
    });
  });

  it('uses transform callbacks in precedence order', () => {
    const TonePlugin = createBasePlugin({
      name: 'tone',
      inject: {
        nodeProps: {
          classNames: {
            red: 'tone-red',
          },
          nodeKey: 'tone',
          styleKey: 'color',
          transformClassName: ({ value }) => `tone-${value}`,
          transformNodeValue: ({ nodeValue }) =>
            typeof nodeValue === 'string' ? nodeValue.toUpperCase() : nodeValue,
          transformProps: ({ props, value }) => ({
            ...props,
            'data-tone': value,
          }),
          transformStyle: ({ value }) => ({ color: value }),
        },
      },
    });

    const editor = createBaseEditor({
      plugins: [TonePlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(TonePlugin).plugin,
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
      targetPluginNames: ['p'],
      name: 'list',
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
      },
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
        editor.plugin(ListishPlugin).plugin,
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
      name: 'pathless',
      inject: {
        nodeProps: {
          styleKey: '',
          transformProps: ({ props }) => props,
        },
      },
    });

    const editor = createBaseEditor({
      plugins: [PathlessPlugin],
    });
    const getPath = mock(() => [0]);

    pluginInjectNodeProps(
      editor,
      editor.plugin(PathlessPlugin).plugin,
      { text: { text: 'hello' } },
      getPath
    );

    expect(getPath).not.toHaveBeenCalled();
  });

  it('skips path-based injection when the live node no longer resolves', () => {
    const transformProps = mock(({ props }) => props);
    const PathPlugin = createBasePlugin({
      name: 'path',
      inject: {
        excludeBelowPlugins: ['quote'],
        nodeProps: {
          nodeKey: 'tone',
          transformProps,
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [PathPlugin],
    });

    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(PathPlugin).plugin,
        { text: { text: 'hello', tone: 'red' } },
        () => undefined
      )
    ).toBeUndefined();

    expect(transformProps).toHaveBeenCalledTimes(1);
    expect(transformProps.mock.calls[0]?.[0].props).toEqual({});
  });
});
