import { createBaseEditor } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph';
import { pluginInjectNodeProps } from './pluginInjectNodeProps';

describe('pluginInjectNodeProps', () => {
  it('returns default class and style props for matching elements', () => {
    const AlignPlugin = defineBasePlugin('align', {
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
        editor.plugin(AlignPlugin),
        {
          element: {
            align: 'center',
            children: [{ text: 'hello' }],
            type: 'paragraph',
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
    const BoldPlugin = defineBasePlugin('bold', {
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
      pluginInjectNodeProps(editor, editor.plugin(BoldPlugin), {}, () => [0])
    ).toBeUndefined();
    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(BoldPlugin),
        { text: { bold: true, text: 'hello' } },
        () => [0]
      )
    ).toBeUndefined();
  });

  it('keeps transformProps hook order when inject matching rejects the node', () => {
    const transformProps = mock(({ props }) => props);
    const TargetPlugin = defineBasePlugin('target', {
      targetPlugins: ['quote'],
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
        editor.plugin(TargetPlugin),
        {
          element: {
            children: [{ text: 'hello' }],
            tone: 'red',
            type: 'paragraph',
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
    const QueryPlugin = defineBasePlugin('query', {
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
        editor.plugin(QueryPlugin),
        { text: { text: 'hello', tone: 'red' } },
        () => [0]
      )
    ).toBeUndefined();

    expect(transformProps).toHaveBeenCalledTimes(1);
    expect(transformProps.mock.calls[0]?.[0].props).toEqual({});
  });

  it('suppresses default node values unless transformProps forces an injection', () => {
    const ForcedPlugin = defineBasePlugin('forced', {
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
    const SilentPlugin = defineBasePlugin('silent', {
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
        editor.plugin(SilentPlugin),
        { text: { bold: false, text: 'hello' } },
        () => [0]
      )
    ).toBeUndefined();
    expect(
      pluginInjectNodeProps(
        editor,
        editor.plugin(ForcedPlugin),
        { text: { bold: false, text: 'hello' } },
        () => [0]
      )
    ).toEqual({
      'data-forced': 'yes',
    });
  });

  it('uses transform callbacks in precedence order', () => {
    const TonePlugin = defineBasePlugin('tone', {
      inject: {
        nodeProps: {
          classNames: {
            red: 'tone-red',
          },
          nodeKey: 'tone',
          styleKey: 'color',
          transformClassName: ({ value }) => `tone-${String(value)}`,
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
        editor.plugin(TonePlugin),
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
    const ListishPlugin = defineBasePlugin('list', {
      targetPlugins: [BaseParagraphPlugin],
      inject: {
        nodeProps: {
          nodeKey: 'markerStyle',
          query: ({ nodeProps }) => !!nodeProps.element?.markerStyle,
          transformProps: ({ props, value }) => ({
            ...props,
            style: {
              ...props.style,
              markerStyle: value,
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
        editor.plugin(ListishPlugin),
        {
          element: {
            children: [{ text: 'hello' }],
            markerStyle: 'disc',
            type: 'paragraph',
          },
        },
        getPath
      )
    ).toEqual({
      className: 'plite-markerStyle-disc',
      style: {
        markerStyle: 'disc',
      },
    });

    expect(getPath).not.toHaveBeenCalled();
  });

  it('does not resolve a path for inject matching when the plugin has no path-based filters', () => {
    const PathlessPlugin = defineBasePlugin('pathless', {
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
      editor.plugin(PathlessPlugin),
      { text: { text: 'hello' } },
      getPath
    );

    expect(getPath).not.toHaveBeenCalled();
  });

  it('skips path-based injection when the live node no longer resolves', () => {
    const transformProps = mock(({ props }) => props);
    const PathPlugin = defineBasePlugin('path', {
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
        editor.plugin(PathPlugin),
        { text: { text: 'hello', tone: 'red' } },
        () => undefined
      )
    ).toBeUndefined();

    expect(transformProps).toHaveBeenCalledTimes(1);
    expect(transformProps.mock.calls[0]?.[0].props).toEqual({});
  });
});
