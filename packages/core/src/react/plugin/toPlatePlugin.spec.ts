import { schema } from '@platejs/plite';

import type { PlatePlugin, RenderNodeWrapper } from './PlatePlugin';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import {
  type ExtendConfig,
  type NodeComponent,
  type PluginConfig,
  type WithAnyKey,
  type BasePlugin,
  createBasePlugin,
} from '../../lib';
import { createPlateEditor } from '../editor';
import { toPlatePlugin } from './toPlatePlugin';

type CodeBlockConfig = PluginConfig<
  'codeBlock',
  { syntax: boolean; syntaxPopularFirst: boolean },
  {
    plugin: {
      getSyntaxState: () => boolean;
    };
    toggleSyntax: () => void;
  }
>;

type CodeBlockConfig2 = CodeBlockConfig & {
  api: {
    plugin: {
      getLanguage: () => string;
    };
    plugin2: {
      setLanguage: (lang: string) => void;
    };
  };
  options: { hotkey: string[] | string };
};

describe('toPlatePlugin', () => {
  const BaseParagraphPlugin = createBasePlugin({
    key: 'p',
    schema: {
      element: { content: schema.content.open({ default: 'text', min: 1 }) },
    },
    options: { t: 1 },
  })
    .extendHtmlCodec(() => ({
      decode: ({ element }) =>
        element.style.fontFamily === 'Consolas' ? undefined : {},
      encode: ({ content }) => ({ children: content, tag: 'p' }),
      match: [{ tag: 'p' }],
    }))
    .extendEditorApi(() => ({
      baseApiMethod: () => 'base',
    }));

  const MockComponent: NodeComponent = () => null;
  const MockAboveComponent: NodeComponent = () => null;

  it('extend a BasePlugin with React-specific properties and API', () => {
    const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin, {
      handlers: { onKeyDown: () => true },
      options: { hotkey: ['mod+opt+0', 'mod+shift+0'] },
      render: { aboveEditable: MockAboveComponent, node: MockComponent },
    }).extendEditorApi(() => ({
      someApiMethod: () => 'API method result',
    }));

    const editor = createPlateEditor({
      plugins: [ParagraphPlugin],
    });
    const resolvedPlugin = getPlateRuntime(editor).plugins.p as any;

    expect(resolvedPlugin.render.node).toBe(MockComponent);
    expect(resolvedPlugin.render.aboveEditable).toBe(MockAboveComponent);
    expect(resolvedPlugin.handlers).toHaveProperty('onKeyDown');
    expect(resolvedPlugin.options).toEqual({
      hotkey: ['mod+opt+0', 'mod+shift+0'],
      t: 1,
    });
    expect(editor.api.baseApiMethod()).toBe('base');
    expect(editor.api.someApiMethod()).toBe('API method result');
  });

  it('extend with a function configuration', () => {
    const ParagraphPlugin = toPlatePlugin(
      BaseParagraphPlugin,
      ({ editor }) => ({
        options: { editorId: editor.id },
        render: { node: MockComponent },
      })
    ).extendEditorApi(({ editor }) => ({
      getEditorId: () => editor.id,
    }));

    const editor = createPlateEditor({
      plugins: [ParagraphPlugin],
    });
    const resolvedPlugin = getPlateRuntime(editor).plugins.p as any;

    expect(resolvedPlugin.render.node).toBe(MockComponent);
    expect(resolvedPlugin.options).toHaveProperty('editorId');
    expect(resolvedPlugin.options.t).toBe(1);
    expect(editor.api.getEditorId()).toBe(editor.id);
  });

  it('add new handlers and API methods', () => {
    const mockOnKeyDown = mock();
    const mockOnNodeChange = mock();

    const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin, {
      handlers: {
        onNodeChange: mockOnNodeChange,
        onKeyDown: mockOnKeyDown,
      },
    }).extendEditorApi(() => ({
      customMethod: () => 'custom result',
    }));

    const editor = createPlateEditor({
      plugins: [ParagraphPlugin],
    });
    const resolvedPlugin = getPlateRuntime(editor).plugins.p as any;

    expect(resolvedPlugin.handlers).toHaveProperty('onKeyDown', mockOnKeyDown);
    expect(resolvedPlugin.handlers).toHaveProperty(
      'onNodeChange',
      mockOnNodeChange
    );
    expect(editor.api.customMethod()).toBe('custom result');
  });

  it('throw an error when extending a non-existent plugin', () => {
    const NonExistentPlugin = { key: 'nonexistent' };

    expect(() => {
      toPlatePlugin(NonExistentPlugin as any, {
        render: { node: MockComponent },
      });
    }).toThrow();
  });

  it('keeps schema creation-owned through Base-to-Plate conversion', () => {
    expect(() =>
      (toPlatePlugin as any)(BaseParagraphPlugin, {
        schema: {
          element: {
            content: schema.content.open({ default: 'text', min: 1 }),
          },
        },
      })
    ).toThrow('cannot define schema through toPlatePlugin()');

    const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin);

    expect(() =>
      (ParagraphPlugin.extend as any)({
        schema: {
          element: {
            content: schema.content.open({ default: 'text', min: 1 }),
          },
        },
      })
    ).toThrow('cannot define schema through .extend()');
  });

  // Type checks for toPlatePlugin
  it('have correct types', () => {
    type TestConfig = PluginConfig<'test', { foo: string }>;
    type ExtendedConfig = PluginConfig<'test', { baz: number; foo: string }>;

    const basePlugin: BasePlugin<TestConfig> = createBasePlugin<TestConfig>({
      key: 'test',
      options: { foo: 'foo' },
    });
    const extended: PlatePlugin<ExtendedConfig> = toPlatePlugin(basePlugin, {
      options: { baz: 123 },
    });

    // This line should not have any type errors
    extended.options.foo;
    extended.options.baz;
  });
});

describe('toPlatePlugin type tests', () => {
  it('keeps resolved options required inside configured render callbacks', () => {
    type RequiredOptionsConfig = PluginConfig<
      'required-options',
      { enabled: boolean; label: string }
    >;

    const wrapper: RenderNodeWrapper<WithAnyKey<RequiredOptionsConfig>> = ({
      getOptions,
    }) => {
      const { enabled, label } = getOptions();

      return enabled ? ({ children }) => `${label}:${children}` : undefined;
    };
    const plugin = toPlatePlugin(
      createBasePlugin<RequiredOptionsConfig>({
        key: 'required-options',
        options: { enabled: true, label: 'ready' },
      })
    ).configure({
      options: { enabled: false },
      render: { belowNodes: wrapper },
    });

    expect(plugin.options.label).toBe('ready');
  });

  it('work with CodeBlockConfig for toPlatePlugin', () => {
    const BaseCodeBlockPlugin = createBasePlugin<CodeBlockConfig>({
      key: 'codeBlock',
      type: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    }).extendEditorApi<CodeBlockConfig['api']>(() => ({
      plugin: {
        getSyntaxState: () => true,
      },
      toggleSyntax: () => {},
    }));

    const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
      handlers: {},
      options: { hotkey: ['mod+opt+8', 'mod+shift+8'] },
    }).extendEditorApi(() => ({
      plugin: {
        getLanguage: () => 'javascript' as string,
      },
      plugin2: {
        setLanguage: (_: string) => {},
      },
    }));

    const editor = createPlateEditor({
      plugins: [CodeBlockPlugin],
    });

    editor.api.plugin.getSyntaxState();
    editor.api.plugin.getLanguage();

    expect(editor.plugin(CodeBlockPlugin).getOptions()).toEqual({
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    });

    // Type checks
    const options = CodeBlockPlugin.options;
    options.syntax;
    options.syntaxPopularFirst;
    options.hotkey;

    // API type checks
    editor.api.toggleSyntax();
    editor.api.plugin.getSyntaxState();
    editor.api.plugin2.setLanguage('python');
    editor.api.plugin.getLanguage();

    // @ts-expect-error - Non-existent method
    editor.api.nonExistentMethod;
  });

  it('work with function-based extension', () => {
    const BaseCodeBlockPlugin = createBasePlugin<CodeBlockConfig>({
      key: 'codeBlock',
      type: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    });

    const CodeBlockPlugin = toPlatePlugin(
      BaseCodeBlockPlugin,
      ({ getOptions }) => {
        // Type check: should have access to base options
        getOptions().syntax;
        getOptions().syntaxPopularFirst;

        return {
          options: { hotkey: ['mod+opt+8', 'mod+shift+8'] },
        };
      }
    );

    expect(
      createPlateEditor({
        plugins: [CodeBlockPlugin],
      })
        .plugin(CodeBlockPlugin)
        .getOptions()
    ).toEqual({
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    });

    // Type checks
    const extendedOptions = CodeBlockPlugin.options;
    extendedOptions.syntax;
    extendedOptions.syntaxPopularFirst;
    extendedOptions.hotkey;
  });

  it('allow partial extension of options', () => {
    type TestConfig = PluginConfig<'test', { bar: number; foo: string }>;

    const PluginBase = createBasePlugin<TestConfig>({
      key: 'test',
      options: { bar: 0, foo: 'initial' },
    });

    const ExtendedPlugin = toPlatePlugin(PluginBase, {
      options: { bar: 42 },
    });

    expect(resolvePluginTest(ExtendedPlugin).options).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const options = ExtendedPlugin.options;
    options.foo;
    options.bar;
  });

  it('allow adding new properties', () => {
    type BaseConfig = PluginConfig<'test', { foo: string }>;
    type ExtendedConfig = ExtendConfig<BaseConfig, { bar: number }>;

    const PluginBase = createBasePlugin<BaseConfig>({
      key: 'test',
      options: { foo: 'initial' },
    });

    const ExtendedPlugin = toPlatePlugin<BaseConfig, { bar: number }>(
      PluginBase,
      {
        options: { bar: 42 },
      }
    );

    expect(resolvePluginTest(ExtendedPlugin).options).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const options = ExtendedPlugin.options;
    options.foo;
    options.bar;

    const ExtendedTPlugin = toPlatePlugin<ExtendedConfig>(PluginBase, {
      options: { bar: 42 },
    });

    expect(resolvePluginTest(ExtendedTPlugin).options).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const options2 = ExtendedTPlugin.options;
    options2.foo;
    options2.bar;
  });
});

// Type tests for toPlatePlugin
describe('toPlatePlugin type tests', () => {
  it('work with CodeBlockConfig for toPlatePlugin', () => {
    const BaseCodeBlockPlugin = createBasePlugin<CodeBlockConfig>({
      key: 'codeBlock',
      type: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    }).extendEditorApi<CodeBlockConfig['api']>(() => ({
      plugin: {
        getSyntaxState: () => true,
      },
      toggleSyntax: () => {},
    }));

    const CodeBlockPlugin = toPlatePlugin<CodeBlockConfig2, CodeBlockConfig>(
      BaseCodeBlockPlugin,
      {
        options: {
          hotkey: ['mod+opt+8', 'mod+shift+8'],
        },
      }
    ).extendEditorApi(() => ({
      plugin: {
        getLanguage: () => 'javascript',
      },
      plugin2: {
        setLanguage: (_: string) => {},
      },
    }));

    const editor = createPlateEditor({
      plugins: [CodeBlockPlugin],
    });

    editor.api.plugin.getLanguage();

    expect(editor.plugin(CodeBlockPlugin).getOptions()).toEqual({
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    });

    // Type checks
    const options = CodeBlockPlugin.options;
    options.syntax;
    options.syntaxPopularFirst;
    options.hotkey;

    // API type checks
    editor.api.toggleSyntax();
    editor.api.plugin.getSyntaxState();
    editor.api.plugin2.setLanguage('python');
    editor.api.plugin.getLanguage();

    // @ts-expect-error - Non-existent method
    editor.api.nonExistentMethod;
  });

  it('work with function-based extension and explicit typing', () => {
    type CodeBlockConfig = PluginConfig<
      'codeBlock',
      { syntax: boolean; syntaxPopularFirst: boolean }
    >;
    type CodeBlockConfig2 = ExtendConfig<CodeBlockConfig, { hotkey: string[] }>;

    const BaseCodeBlockPlugin = createBasePlugin<CodeBlockConfig>({
      key: 'codeBlock',
      type: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    });

    const CodeBlockPlugin2 = toPlatePlugin<CodeBlockConfig2, CodeBlockConfig>(
      BaseCodeBlockPlugin,
      ({ getOptions }) => {
        // @ts-expect-error
        getOptions().nonExisting;
        getOptions().syntax;

        return {
          options: { hotkey: ['mod+opt+8', 'mod+shift+8'] },
        };
      }
    );

    expect(
      createPlateEditor({
        plugins: [CodeBlockPlugin2],
      })
        .plugin(CodeBlockPlugin2)
        .getOptions()
    ).toEqual({
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    });
  });
});

describe('toPlatePlugin with direct merge for object configs', () => {
  it('directly merge object configs without pushing to __extensions', () => {
    type LinkConfig = PluginConfig<
      'link',
      {
        allowedSchemes: string[];
        isUrl: (text: string) => boolean;
      }
    >;

    const isUrl = (text: string) => text.startsWith('http');

    const BaseLinkPlugin = createBasePlugin<LinkConfig>({
      key: 'link',
      options: {
        allowedSchemes: ['http', 'https'],
        isUrl,
      },
    }).extend(() => ({
      options: {
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      },
    }));

    const LinkPlugin = toPlatePlugin(BaseLinkPlugin, {
      options: {
        allowedSchemes: ['http', 'https', 'mailto'],
      },
    });

    expect(LinkPlugin.options).toEqual({
      allowedSchemes: ['http', 'https', 'mailto'],
      isUrl,
    });

    expect(resolvePluginTest(LinkPlugin).options).toEqual({
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      isUrl,
    });
  });

  it('keeps withComponent on the Plate wrapper', () => {
    const NewComponent: NodeComponent = () => null;

    const basePlugin = createBasePlugin({
      key: 'testPlugin',
    });

    const plugin = toPlatePlugin(basePlugin);

    const componentPlugin = plugin.withComponent(NewComponent);
    const resolvedPlugin = resolvePluginTest(componentPlugin);

    expect(resolvedPlugin.render.node).toBe(NewComponent);
  });

  it('preserves terminal configuration through the Plate wrapper', () => {
    const configured = createBasePlugin({
      key: 'configuredBase',
    }).configure({});
    const plugin = toPlatePlugin(configured);

    expect(() => (plugin.extend as any)({})).toThrow('already configured');
    expect(() => (plugin.extendCodecs as any)(() => ({}))).toThrow(
      'already configured'
    );
    expect(() => (plugin.extendHtmlCodec as any)(() => ({}))).toThrow(
      'already configured'
    );
  });
});
