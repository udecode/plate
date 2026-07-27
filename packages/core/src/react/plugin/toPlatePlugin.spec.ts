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
  initialState: { hotkey: string[] | string };
};

describe('toPlatePlugin', () => {
  const BaseParagraphPlugin = createBasePlugin({
    key: 'p',
    schema: {
      element: { content: schema.content.open({ default: 'text', min: 1 }) },
    },
    initialState: { t: 1 },
    codecs: ({ defineCodecs }) =>
      defineCodecs({
        'text/html': {
          decode: ({ element }) =>
            element.style.fontFamily === 'Consolas' ? undefined : {},
          encode: ({ content }) => ({ children: content, tag: 'p' }),
          match: [{ tag: 'p' }],
        },
      }),
  }).extend(() => ({
    extension: {
      api: {
        baseApiMethod: () => 'base',
      },
    },
  }));

  const MockComponent: NodeComponent = () => null;
  const MockAboveComponent: NodeComponent = () => null;

  it('extend a BasePlugin with React-specific properties and API', () => {
    const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin, {
      component: MockComponent,
      handlers: { onKeyDown: () => true },
      initialState: { hotkey: ['mod+opt+0', 'mod+shift+0'] },
      render: { aboveEditable: MockAboveComponent },
    }).extend(() => ({
      extension: {
        api: {
          someApiMethod: () => 'API method result',
        },
      },
    }));

    const editor = createPlateEditor({
      plugins: [ParagraphPlugin],
    });
    const resolvedPlugin = getPlateRuntime(editor).plugins.p as any;

    expect(resolvedPlugin.render.node).toBe(MockComponent);
    expect(resolvedPlugin.render.aboveEditable).toBe(MockAboveComponent);
    expect(resolvedPlugin.handlers).toHaveProperty('onKeyDown');
    expect(resolvedPlugin.initialState).toEqual({
      hotkey: ['mod+opt+0', 'mod+shift+0'],
      t: 1,
    });
    expect(editor.api.baseApiMethod()).toBe('base');
    expect(editor.api.someApiMethod()).toBe('API method result');
  });

  it('extend with a function configuration', () => {
    const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin, {
      component: MockComponent,
    }).extend(({ editor }) => ({
      initialState: { editorId: editor.id },
      extension: {
        api: {
          getEditorId: () => editor.id,
        },
      },
    }));

    const editor = createPlateEditor({
      plugins: [ParagraphPlugin],
    });
    const resolvedPlugin = getPlateRuntime(editor).plugins.p as any;

    expect(resolvedPlugin.render.node).toBe(MockComponent);
    expect(resolvedPlugin.initialState).toHaveProperty('editorId');
    expect(resolvedPlugin.initialState.t).toBe(1);
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
    }).extend(() => ({
      extension: {
        api: {
          customMethod: () => 'custom result',
        },
      },
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
        initialState: {},
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
      initialState: { foo: 'foo' },
    });
    const extended: PlatePlugin<ExtendedConfig> = toPlatePlugin(basePlugin, {
      initialState: { baz: 123 },
    });

    // This line should not have any type errors
    extended.initialState.foo;
    extended.initialState.baz;
  });
});

describe('toPlatePlugin type tests', () => {
  it('keeps resolved initialState required inside configured render callbacks', () => {
    type RequiredOptionsConfig = PluginConfig<
      'required-initialState',
      { enabled: boolean; label: string }
    >;

    const wrapper: RenderNodeWrapper<WithAnyKey<RequiredOptionsConfig>> = ({
      store,
    }) => {
      const { enabled, label } = store.get();

      return enabled ? ({ children }) => `${label}:${children}` : undefined;
    };
    const plugin = toPlatePlugin(
      createBasePlugin<RequiredOptionsConfig>({
        key: 'required-initialState',
        initialState: { enabled: true, label: 'ready' },
      })
    ).configure({
      initialState: { enabled: false },
      render: { belowNodes: wrapper },
    });

    expect(plugin.initialState.label).toBe('ready');
  });

  it('work with CodeBlockConfig for toPlatePlugin', () => {
    const BaseCodeBlockPlugin = createBasePlugin<CodeBlockConfig>({
      key: 'codeBlock',
      type: 'code_block',
      initialState: { syntax: true, syntaxPopularFirst: false },
    }).extend<{ extension: { api: CodeBlockConfig['api'] } }>(() => ({
      extension: {
        api: {
          plugin: {
            getSyntaxState: () => true,
          },
          toggleSyntax: () => {},
        },
      },
    }));

    const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
      handlers: {},
      initialState: { hotkey: ['mod+opt+8', 'mod+shift+8'] },
    }).extend(() => ({
      extension: {
        api: {
          plugin: {
            getLanguage: () => 'javascript' as string,
          },
          plugin2: {
            setLanguage: (_: string) => {},
          },
        },
      },
    }));

    const editor = createPlateEditor({
      plugins: [CodeBlockPlugin],
    });

    editor.api.plugin.getSyntaxState();
    editor.api.plugin.getLanguage();

    expect(editor.plugin(CodeBlockPlugin).store.get()).toEqual({
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    });

    // Type checks
    const initialState = CodeBlockPlugin.initialState;
    initialState.syntax;
    initialState.syntaxPopularFirst;
    initialState.hotkey;

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
      initialState: { syntax: true, syntaxPopularFirst: false },
    });

    const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, ({ store }) => {
      // Type check: should have access to base initialState
      store.get().syntax;
      store.get().syntaxPopularFirst;

      return {
        initialState: { hotkey: ['mod+opt+8', 'mod+shift+8'] },
      };
    });

    expect(
      createPlateEditor({
        plugins: [CodeBlockPlugin],
      })
        .plugin(CodeBlockPlugin)
        .store.get()
    ).toEqual({
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    });

    // Type checks
    const extendedOptions = CodeBlockPlugin.initialState;
    extendedOptions.syntax;
    extendedOptions.syntaxPopularFirst;
    extendedOptions.hotkey;
  });

  it('allow partial extension of initialState', () => {
    type TestConfig = PluginConfig<'test', { bar: number; foo: string }>;

    const PluginBase = createBasePlugin<TestConfig>({
      key: 'test',
      initialState: { bar: 0, foo: 'initial' },
    });

    const ExtendedPlugin = toPlatePlugin(PluginBase, {
      initialState: { bar: 42 },
    });

    expect(resolvePluginTest(ExtendedPlugin).initialState).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const initialState = ExtendedPlugin.initialState;
    initialState.foo;
    initialState.bar;
  });

  it('allow adding new properties', () => {
    type BaseConfig = PluginConfig<'test', { foo: string }>;
    type ExtendedConfig = ExtendConfig<BaseConfig, { bar: number }>;

    const PluginBase = createBasePlugin<BaseConfig>({
      key: 'test',
      initialState: { foo: 'initial' },
    });

    const ExtendedPlugin = toPlatePlugin<BaseConfig, { bar: number }>(
      PluginBase,
      {
        initialState: { bar: 42 },
      }
    );

    expect(resolvePluginTest(ExtendedPlugin).initialState).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const initialState = ExtendedPlugin.initialState;
    initialState.foo;
    initialState.bar;

    const ExtendedTPlugin = toPlatePlugin<ExtendedConfig>(PluginBase, {
      initialState: { bar: 42 },
    });

    expect(resolvePluginTest(ExtendedTPlugin).initialState).toEqual({
      bar: 42,
      foo: 'initial',
    });

    // Type checks
    const options2 = ExtendedTPlugin.initialState;
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
      initialState: { syntax: true, syntaxPopularFirst: false },
    }).extend<{ extension: { api: CodeBlockConfig['api'] } }>(() => ({
      extension: {
        api: {
          plugin: {
            getSyntaxState: () => true,
          },
          toggleSyntax: () => {},
        },
      },
    }));

    const CodeBlockPlugin = toPlatePlugin<CodeBlockConfig2, CodeBlockConfig>(
      BaseCodeBlockPlugin,
      {
        initialState: {
          hotkey: ['mod+opt+8', 'mod+shift+8'],
        },
      }
    ).extend(() => ({
      extension: {
        api: {
          plugin: {
            getLanguage: () => 'javascript',
          },
          plugin2: {
            setLanguage: (_: string) => {},
          },
        },
      },
    }));

    const editor = createPlateEditor({
      plugins: [CodeBlockPlugin],
    });

    editor.api.plugin.getLanguage();

    expect(editor.plugin(CodeBlockPlugin).store.get()).toEqual({
      hotkey: ['mod+opt+8', 'mod+shift+8'],
      syntax: true,
      syntaxPopularFirst: false,
    });

    // Type checks
    const initialState = CodeBlockPlugin.initialState;
    initialState.syntax;
    initialState.syntaxPopularFirst;
    initialState.hotkey;

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
      initialState: { syntax: true, syntaxPopularFirst: false },
    });

    const CodeBlockPlugin2 = toPlatePlugin<CodeBlockConfig2, CodeBlockConfig>(
      BaseCodeBlockPlugin,
      ({ store }) => {
        // @ts-expect-error
        store.get().nonExisting;
        store.get().syntax;

        return {
          initialState: { hotkey: ['mod+opt+8', 'mod+shift+8'] },
        };
      }
    );

    expect(
      createPlateEditor({
        plugins: [CodeBlockPlugin2],
      })
        .plugin(CodeBlockPlugin2)
        .store.get()
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
      initialState: {
        allowedSchemes: ['http', 'https'],
        isUrl,
      },
    }).extend(() => ({
      initialState: {
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      },
    }));

    const LinkPlugin = toPlatePlugin(BaseLinkPlugin, {
      initialState: {
        allowedSchemes: ['http', 'https', 'mailto'],
      },
    });

    expect(LinkPlugin.initialState).toEqual({
      allowedSchemes: ['http', 'https', 'mailto'],
      isUrl,
    });

    expect(resolvePluginTest(LinkPlugin).initialState).toEqual({
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      isUrl,
    });
  });

  it('configures a component on the Plate wrapper', () => {
    const NewComponent: NodeComponent = () => null;

    const basePlugin = createBasePlugin({
      key: 'testPlugin',
    });

    const plugin = toPlatePlugin(basePlugin);

    const componentPlugin = plugin.configure({ component: NewComponent });
    const resolvedPlugin = resolvePluginTest(componentPlugin);

    expect(resolvedPlugin.render.node).toBe(NewComponent);
  });

  it('preserves terminal configuration through the Plate wrapper', () => {
    const configured = createBasePlugin({
      key: 'configuredBase',
    }).configure({});
    const plugin = toPlatePlugin(configured);

    expect(() => (plugin.extend as any)({})).toThrow('already configured');
  });
});
