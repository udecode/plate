import type {
  PlatePlugin,
  PlatePluginComponent,
  WithOverride,
} from './PlatePlugin';

import {
  type ExtendConfig,
  type HotkeyPluginOptions,
  type PluginConfig,
  type SlatePlugin,
  createSlatePlugin,
  createTSlatePlugin,
} from '../../lib';
import { createPlateEditor } from '../editor';
import { extendPlatePlugin, extendTPlatePlugin } from './extendPlatePlugin';

type CodeBlockConfig = PluginConfig<
  'code_block',
  { syntax: boolean; syntaxPopularFirst: boolean },
  {
    plugin: {
      getSyntaxState: () => boolean;
    };
    toggleSyntax: () => void;
  }
>;

type CodeBlockConfig2 = {
  api: {
    plugin: {
      getLanguage: () => string;
    };
    plugin2: {
      setLanguage: (lang: string) => void;
    };
  };
  options: HotkeyPluginOptions;
} & CodeBlockConfig;

describe('extendPlatePlugin', () => {
  const BaseParagraphPlugin = createSlatePlugin({
    deserializeHtml: {
      query: ({ element }) => element.style.fontFamily !== 'Consolas',
      rules: [{ validNodeName: 'P' }],
    },
    isElement: true,
    key: 'p',
    options: { t: 1 },
  }).extendApi(() => ({
    baseApiMethod: () => 'base',
  }));

  const MockComponent: PlatePluginComponent = () => null;
  const MockAboveComponent: PlatePluginComponent = () => null;

  it('should extend a SlatePlugin with React-specific properties and API', () => {
    const ParagraphPlugin = extendPlatePlugin(BaseParagraphPlugin, {
      component: MockComponent,
      handlers: { onKeyDown: () => true },
      options: { hotkey: ['mod+opt+0', 'mod+shift+0'] },
      renderAboveEditable: MockAboveComponent,
    }).extendApi(() => ({
      someApiMethod: () => 'API method result',
    }));

    const editor = createPlateEditor({ plugins: [ParagraphPlugin] });
    const resolvedPlugin = editor.plugins.p;

    expect(resolvedPlugin.component).toBe(MockComponent);
    expect(resolvedPlugin.renderAboveEditable).toBe(MockAboveComponent);
    expect(resolvedPlugin.handlers).toHaveProperty('onKeyDown');
    expect(resolvedPlugin.options).toEqual({
      hotkey: ['mod+opt+0', 'mod+shift+0'],
      t: 1,
    });
    expect(resolvedPlugin.api.baseApiMethod()).toBe('base');
    expect(resolvedPlugin.api.someApiMethod()).toBe('API method result');
  });

  it('should extend with a function configuration', () => {
    const ParagraphPlugin = extendPlatePlugin(
      BaseParagraphPlugin,
      ({ editor }) => ({
        component: MockComponent,
        options: { editorId: editor.id },
      })
    ).extendApi(({ editor }) => ({
      getEditorId: () => editor.id,
    }));

    const editor = createPlateEditor({ plugins: [ParagraphPlugin] });
    const resolvedPlugin = editor.plugins.p;

    expect(resolvedPlugin.component).toBe(MockComponent);
    expect(resolvedPlugin.options).toHaveProperty('editorId');
    expect(resolvedPlugin.options.t).toBe(1);
    expect(resolvedPlugin.api.getEditorId()).toBe(editor.id);
  });

  it('should add new handlers and API methods', () => {
    const mockOnKeyDown = jest.fn();
    const mockOnChange = jest.fn();

    const ParagraphPlugin = extendPlatePlugin(BaseParagraphPlugin, {
      handlers: {
        onChange: mockOnChange,
        onKeyDown: mockOnKeyDown,
      },
    }).extendApi(() => ({
      customMethod: () => 'custom result',
    }));

    const editor = createPlateEditor({ plugins: [ParagraphPlugin] });
    const resolvedPlugin = editor.plugins.p;

    expect(resolvedPlugin.handlers).toHaveProperty('onKeyDown', mockOnKeyDown);
    expect(resolvedPlugin.handlers).toHaveProperty('onChange', mockOnChange);
    expect(resolvedPlugin.api.customMethod()).toBe('custom result');
  });

  it('should throw an error when extending a non-existent plugin', () => {
    const NonExistentPlugin = { key: 'nonexistent' };

    expect(() => {
      extendPlatePlugin(NonExistentPlugin as any, { component: MockComponent });
    }).toThrow();
  });

  // Type checks for extendPlatePlugin
  it('should have correct types', () => {
    type TestConfig = PluginConfig<'test', { foo: string }>;
    type ExtendedConfig = PluginConfig<'test', { baz: number; foo: string }>;

    const basePlugin: SlatePlugin<TestConfig> = createTSlatePlugin();
    const extended: PlatePlugin<ExtendedConfig> = extendPlatePlugin(
      basePlugin,
      {
        options: { baz: 123 },
      }
    );

    // This line should not have any type errors
    extended.options.foo;
    extended.options.baz;
  });
});

describe('extendPlatePlugin type tests', () => {
  it('should work with CodeBlockConfig for extendPlatePlugin', () => {
    const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
      key: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    }).extendApi<CodeBlockConfig['api']>(() => ({
      plugin: {
        getSyntaxState: () => true,
      },
      toggleSyntax: () => {},
    }));

    const CodeBlockPlugin = extendPlatePlugin(BaseCodeBlockPlugin, {
      handlers: {
        // TODO
        // onKeyDown: (() => {}) as KeyboardHandler<
        //   PluginConfig<any, HotkeyPluginOptions, any>
        // >,
      },
      options: { hotkey: ['mod+opt+8', 'mod+shift+8'] } as HotkeyPluginOptions,
      withOverrides: ({ api, editor }) => {
        api.plugin.getSyntaxState();
        // @ts-expect-error
        api.plugin.getLanguage();

        return editor;
      },
    })
      .extendApi(() => ({
        plugin: {
          getLanguage: () => 'javascript' as string,
        },
        plugin2: {
          setLanguage: (_: string) => {},
        },
      }))
      .extend({
        withOverrides: ({ api, editor }) => {
          api.plugin.getSyntaxState();
          api.plugin.getLanguage();

          return editor;
        },
      });

    const editor = createPlateEditor({
      plugins: [CodeBlockPlugin],
    });

    expect(CodeBlockPlugin.options).toEqual({
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

    // Plugin API type checks
    const pluginApi = editor.plugins.code_block.api;
    pluginApi.toggleSyntax();
    pluginApi.plugin.getSyntaxState();
    pluginApi.plugin2.setLanguage('ruby');
    pluginApi.plugin.getLanguage();

    // @ts-expect-error - Non-existent method
    editor.api.nonExistentMethod();

    // @ts-expect-error - Non-existent method
    pluginApi.nonExistentMethod();
  });

  it('should work with function-based extension', () => {
    const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
      key: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    });

    const CodeBlockPlugin = extendPlatePlugin(
      BaseCodeBlockPlugin,
      ({ options }) => {
        // Type check: should have access to base options
        options.syntax;
        options.syntaxPopularFirst;

        return {
          options: { hotkey: ['mod+opt+8', 'mod+shift+8'] },
        };
      }
    );

    expect(CodeBlockPlugin.options).toEqual({
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

  it('should allow partial extension of options', () => {
    type TestConfig = PluginConfig<'test', { bar: number; foo: string }>;

    const BasePlugin = createTSlatePlugin<TestConfig>({
      key: 'test',
      options: { bar: 0, foo: 'initial' },
    });

    const ExtendedPlugin = extendPlatePlugin(BasePlugin, {
      options: { bar: 42 },
    });

    expect(ExtendedPlugin.options).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const options = ExtendedPlugin.options;
    options.foo;
    options.bar;
  });

  it('should allow adding new properties', () => {
    type BaseConfig = PluginConfig<'test', { foo: string }>;
    type ExtendedConfig = ExtendConfig<BaseConfig, { bar: number }>;

    const BasePlugin = createTSlatePlugin<BaseConfig>({
      key: 'test',
      options: { foo: 'initial' },
    });

    const ExtendedPlugin = extendPlatePlugin<BaseConfig, { bar: number }>(
      BasePlugin,
      {
        options: { bar: 42 },
      }
    );

    expect(ExtendedPlugin.options).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const options = ExtendedPlugin.options;
    options.foo;
    options.bar;

    const ExtendedTPlugin = extendTPlatePlugin<ExtendedConfig>(BasePlugin, {
      options: { bar: 42 },
    });

    expect(ExtendedTPlugin.options).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const options2 = ExtendedTPlugin.options;
    options2.foo;
    options2.bar;
  });
});

// Type tests for extendTPlatePlugin
describe('extendTPlatePlugin type tests', () => {
  it('should work with CodeBlockConfig for extendTPlatePlugin', () => {
    type WithOverride2 = WithOverride<CodeBlockConfig2>;

    const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
      key: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    }).extendApi<CodeBlockConfig['api']>(() => ({
      plugin: {
        getSyntaxState: () => true,
      },
      toggleSyntax: () => {},
    }));

    const CodeBlockPlugin = extendTPlatePlugin<
      CodeBlockConfig2,
      CodeBlockConfig
    >(BaseCodeBlockPlugin, {
      handlers: {
        // TODO
        // onKeyDown: (() => {}) as KeyboardHandler<
        //   PluginConfig<any, HotkeyPluginOptions>
        // >,
      },
      options: {
        hotkey: ['mod+opt+8', 'mod+shift+8'],
      },
      withOverrides: ({ api, editor }) => {
        api.plugin.getLanguage!();

        return editor;
      },
    })
      .extendApi(() => ({
        plugin: {
          getLanguage: () => 'javascript',
        },
        plugin2: {
          setLanguage: (_: string) => {},
        },
      }))
      .extend({
        // TODO
        // withOverrides: (({ api, editor }) => {
        //   api.plugin.getLanguage!();
        //
        //   return editor;
        // }) as WithOverride2,
      });

    const editor = createPlateEditor({
      plugins: [CodeBlockPlugin],
    });

    expect(CodeBlockPlugin.options).toEqual({
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

    // Plugin API type checks
    const pluginApi = editor.plugins.code_block.api;
    pluginApi.toggleSyntax();
    pluginApi.plugin.getSyntaxState();
    pluginApi.plugin2.setLanguage('ruby');
    pluginApi.plugin.getLanguage();

    // @ts-expect-error - Non-existent method
    editor.api.nonExistentMethod();

    // @ts-expect-error - Non-existent method
    pluginApi.nonExistentMethod();
  });

  it('should work with function-based extension and explicit typing', () => {
    type CodeBlockConfig = PluginConfig<
      'code_block',
      { syntax: boolean; syntaxPopularFirst: boolean }
    >;
    type CodeBlockConfig2 = ExtendConfig<CodeBlockConfig, { hotkey: string[] }>;

    const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
      key: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    });

    const CodeBlockPlugin2 = extendTPlatePlugin<
      CodeBlockConfig2,
      CodeBlockConfig
    >(BaseCodeBlockPlugin, ({ options }) => {
      // @ts-expect-error
      options.nonExisting;
      options.syntax;

      return {
        options: { hotkey: ['mod+opt+8', 'mod+shift+8'] },
      };
    });

    expect(CodeBlockPlugin2.options).toEqual({
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    });
  });
});
