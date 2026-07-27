// Core type contracts for base plugins and their editor extensions.
import {
  HistoryPlugin,
  type ExtendConfig,
  type PluginConfig,
  createBaseEditor,
  createBasePlugin,
  getEditorPlugin,
} from '@platejs/core';
import { toPlatePlugin } from '../src/react/plugin/toPlatePlugin';
import {
  ContentSlice,
  defineEditorExtension,
  property,
  schema,
  target,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';

const baseSingleExtension = defineEditorExtension({
  name: 'base-single-extension',
});
const baseArrayExtension = defineEditorExtension({
  name: 'base-array-extension',
});
const baseFactoryExtension = defineEditorExtension({
  name: 'base-factory-extension',
});

const BoldPlugin = createBasePlugin({
  key: 'bold',
  initialState: {
    enabled: true as const,
    hotkey: 'mod+b',
  },
  extension: baseSingleExtension,
}).extend(({ store }) => ({
  extension: {
    api: {
      toggleBold: () => store.get().hotkey,
    },
  },
}));

const CodecContractPlugin = createBasePlugin({
  key: 'codecContract',
  codecs: ({ defineCodecs, editor, plugin }) =>
    defineCodecs({
      'application/x-codec-contract': {
        scope: 'document',
        decode: ({ data, format, source, state }) => {
          const exactData: string = data;
          const exactEditorId: string = editor.id;
          const exactFormat: string = format;
          const exactPluginKey: 'codecContract' = plugin.key;
          const exactSchema: object = state.schema;
          const exactTypes: readonly string[] = source.types;

          void exactData;
          void exactEditorId;
          void exactFormat;
          void exactPluginKey;
          void exactSchema;
          void exactTypes;

          return ContentSlice.closed([{ text: data }]);
        },
        encode: ({ format, slice, state }) => {
          const exactFormat: string = format;
          const exactOpenStart: number = slice.openStart;
          const exactSchema: object = state.schema;

          void exactFormat;
          void exactOpenStart;
          void exactSchema;

          return 'encoded';
        },
      },
    }),
});

const HtmlParagraphContractPlugin = createBasePlugin({
  key: 'htmlParagraphContract',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  type: 'html-paragraph-contract',
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const readonlyElement: Readonly<HTMLElement> = element;

          // @ts-expect-error Decode callbacks receive a read-only DOM view.
          element.id = 'mutated';

          void readonlyElement;

          return {};
        },
        encode: ({ content, node }) => {
          const configuredType: string = node.type;

          // @ts-expect-error Terminal configuration can replace the authored type.
          const staleAuthoredType: 'html-paragraph-contract' = node.type;

          void configuredType;
          void staleAuthoredType;

          return { children: content, tag: 'p' };
        },
        match: [{ tag: 'p' }],
      },
    }),
});

void HtmlParagraphContractPlugin;

HtmlParagraphContractPlugin.configure({
  // @ts-expect-error Terminal configuration cannot replace authored schema.
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const assertSchemaCreationOwnership = () => {
  const Base = createBasePlugin({ key: 'schemaCreationOnly' });

  // @ts-expect-error Descriptor schema is immutable after creation.
  Base.schema = null;
  Base.extend({
    // @ts-expect-error Static extensions cannot declare schema.
    schema: { mark: property.boolean() },
  });
  Base.configure({
    // @ts-expect-error Terminal configuration cannot declare schema.
    schema: { mark: property.boolean() },
  });

  const Plate = toPlatePlugin(Base);

  Plate.extend({
    // @ts-expect-error Plate static extensions cannot declare schema.
    schema: { mark: property.boolean() },
  });
  toPlatePlugin(Base, {
    // @ts-expect-error Base-to-Plate conversion cannot declare schema.
    schema: { mark: property.boolean() },
  });
};

void assertSchemaCreationOwnership;

const assertForeignHtmlTarget = () => {
  const Owner = createBasePlugin({
    key: 'foreignTargetOwner',
    schema: { mark: property.boolean() },
  });

  Owner.extend(({ defineCodecs }) => ({
    codecs: defineCodecs(Owner, {
      'text/html': {
        decode: () => true,
        decodeOnly: true,
        match: [{ tag: 'strong' }],
      },
    }),
  }));
};

void assertForeignHtmlTarget;

const HtmlBoldContractPlugin = createBasePlugin({
  key: 'htmlBoldContract',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          element.tagName === 'STRONG' ? true : undefined,
        encode: ({ node, value }) => {
          const exactText: string = node.text;
          const exactValue: boolean = value;

          void exactText;
          void exactValue;

          return value ? { tag: 'strong' } : null;
        },
        match: [{ tag: ['strong', 'b'] }],
      },
    }),
});

void HtmlBoldContractPlugin;

createBasePlugin({
  key: 'rawHtmlCodecContract',
  // @ts-expect-error Codec declarations must be branded by defineCodecs. @plate-schema-adoption-negative-codec
  codecs: () => ({
    'text/html': {
      decode: () => true,
      decodeOnly: true,
      match: [{ tag: 'strong' }],
    },
  }),
});

createBasePlugin({
  key: 'tupleHtmlCodecContract',
  schema: { mark: property.boolean() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': [
        {
          decode: () => true,
          decodeOnly: true,
          match: [{ tag: 'strong' }],
        },
        {
          decode: () => true,
          decodeOnly: true,
          match: [{ tag: 'b' }],
        },
      ],
    }),
});

createBasePlugin({
  key: 'invalidHtmlMarkOutput',
  schema: { mark: property.boolean() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      // @ts-expect-error Mark encoders return a childless wrapper with a tag.
      'text/html': {
        decode: () => true,
        encode: () => ({ style: { fontWeight: 'bold' } }),
        match: [{ tag: 'strong' }],
      },
    }),
});

const HtmlAlignContractPlugin = createBasePlugin({
  key: 'htmlAlignContract',
  schema: {
    properties: [
      schema.elementProperty('align', property.string(), {
        target: target.type('html-paragraph-contract'),
      }),
    ],
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.textAlign || undefined,
        encode: ({ node, value }) => {
          const exactType: string = node.type;
          const exactValue: string = value;

          void exactType;
          void exactValue;

          return { style: { textAlign: value } };
        },
        match: [{ style: { textAlign: '*' } }],
      },
    }),
});

void HtmlAlignContractPlugin;

createBasePlugin({
  key: 'invalidHtmlPropertyOutput',
  schema: {
    properties: [
      schema.elementProperty('align', property.string(), {
        target: target.type('html-paragraph-contract'),
      }),
    ],
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      // @ts-expect-error Ordinary element-property encoders cannot replace the tag.
      'text/html': {
        decode: () => 'left',
        encode: () => ({ tag: 'p' }),
        match: [{ style: { textAlign: '*' } }],
      },
    }),
});

const HtmlListContractPlugin = createBasePlugin({
  key: 'htmlListContract',
  schema: {
    properties: [
      schema.elementProperty('listStart', property.number(), {
        target: target.type('html-paragraph-contract'),
      }),
      schema.elementProperty('listStyle', property.string(), {
        target: target.type('html-paragraph-contract'),
      }),
    ],
  },
  targetPluginKeys: [HtmlParagraphContractPlugin.key],
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        createsElement: true,
        decode: ({ element }) => ({
          listStart: Number(element.getAttribute('start')) || undefined,
          listStyle: element.tagName === 'OL' ? 'decimal' : 'disc',
        }),
        encode: ({ content, node }) => {
          const exactStart: number | undefined = node.listStart;
          const exactStyle: string | undefined = node.listStyle;
          const configuredType: string = node.type;

          void exactStart;
          void exactStyle;
          void configuredType;

          // @ts-expect-error Runtime targetPluginKeys configuration can replace it.
          const stalePrimaryType: 'html-paragraph-contract' = node.type;

          void stalePrimaryType;

          return {
            children: [
              {
                children: content,
                patchTarget: true,
                tag: 'li',
              },
            ],
            tag: 'ol',
          };
        },
        match: [{ tag: ['ol', 'ul'] }],
      },
    }),
});

void HtmlListContractPlugin;

const PrefixHtmlContractPlugin = createBasePlugin({
  key: 'prefixHtmlContract',
  schema: {
    properties: [
      schema.elementProperty(schema.key.prefix('data-'), property.string(), {
        target: target.type('html-paragraph-contract'),
      }),
    ],
  },
});

PrefixHtmlContractPlugin.extend(({ defineCodecs }) => ({
  codecs: defineCodecs({
    // @ts-expect-error HTML codecs require exact owned schema-property keys.
    'text/html': {
      decode: () => ({}),
      decodeOnly: true,
      match: [{ tag: 'p' }],
    },
  }),
}));

const ConfiguredHtmlForeignTarget = createBasePlugin({
  key: 'configuredHtmlForeignTarget',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { variant: property.string() },
    },
  },
}).configure({ type: 'configured-html-foreign-target' });

const HtmlForeignContractPlugin = createBasePlugin({
  key: 'htmlForeignContract',
  codecs: ({ defineCodecs }) =>
    defineCodecs(ConfiguredHtmlForeignTarget, {
      'text/html': {
        decode: ({ element }) => ({ variant: element.dataset.variant }),
        encode: ({ content, node }) => {
          const configuredType: string = node.type;
          const exactVariant: string | undefined = node.variant;

          // @ts-expect-error Key-based installation cannot prove one terminal type.
          const staleDescriptorType: 'configured-html-foreign-target' =
            node.type;

          void configuredType;
          void exactVariant;
          void staleDescriptorType;

          return { children: content, tag: 'aside' };
        },
        match: [{ tag: 'aside' }],
      },
    }),
});

void HtmlForeignContractPlugin;

createBasePlugin({
  key: 'invalidForeignCreatesElement',
  codecs: ({ defineCodecs }) =>
    defineCodecs(HtmlAlignContractPlugin, {
      // @ts-expect-error Foreign property codecs cannot create element identity.
      'text/html': {
        createsElement: true,
        decode: () => 'left',
        encode: () => ({ style: { textAlign: 'left' } }),
        match: [{ tag: 'p' }],
      },
    }),
});

createBasePlugin({
  key: 'arrayCodecContract',
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'application/x-array-contract': {
        // @ts-expect-error Codec decode returns an exact ContentSlice, never an array.
        decode: () => [{ text: 'invalid' }],
        scope: 'document',
      },
    }),
});

createBasePlugin({
  key: 'identityCodecContract',
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'application/x-identity-contract': {
        decode: () => null,
        // @ts-expect-error Codec owner identity is inferred from the plugin.
        owner: 'manual',
        scope: 'document',
      },
    }),
});

createBasePlugin({
  key: 'invalidGenericHtmlContract',
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      // @ts-expect-error Generic product codecs cannot claim text/html.
      'text/html': {
        decode: () => null,
        scope: 'document',
      },
    }),
});

const ConfiguredCodecContractPlugin = CodecContractPlugin.configure({});

// @ts-expect-error Consumer configuration is terminal for codec authoring.
ConfiguredCodecContractPlugin.extend(({ defineCodecs }) => ({
  codecs: defineCodecs({}),
}));

const ConfiguredHtmlContractPlugin = HtmlParagraphContractPlugin.configure({});

// @ts-expect-error Consumer configuration is terminal for HTML codec authoring.
ConfiguredHtmlContractPlugin.extend(({ defineCodecs }) => ({
  codecs: defineCodecs({
    'text/html': {
      decode: () => ({}),
      decodeOnly: true,
      match: [{ tag: 'p' }],
    },
  }),
}));

type CalloutConfig = PluginConfig<
  'callout',
  {
    dismissible?: boolean;
    variant: 'info' | 'warning';
  },
  {
    setVariant: (variant: 'info' | 'warning') => void;
  }
>;

type ExtendConfigBase = PluginConfig<
  'extendConfig',
  { baseOption: true },
  { baseApi: () => 'base' },
  { extendConfig: { baseTx: () => void } },
  { baseSelector: () => boolean },
  { baseState: 'base' }
>;

type ExtendedFullConfig = ExtendConfig<
  ExtendConfigBase,
  { extraOption: 1 },
  { extraApi: () => 2 },
  { extendConfig: { extraTx: (value: 'tx') => void } },
  { extraSelector: () => 3 },
  { extraState: 4 }
>;

type UnifiedListUpdate = {
  toggle: (initialState: { type: 'bulleted' | 'numbered' }) => string;
};

const UnifiedListPlugin = createBasePlugin({
  key: 'unifiedList',
  initialState: {
    prefix: 'list' as const,
  },
  read: ({ state }) => ({
    getPrevious: (type: 'bulleted' | 'numbered') =>
      `list:${state.children().length}:${type}`,
  }),
}).extend<{ update: UnifiedListUpdate }>(({ store, read }) => {
  const readPrevious: string = read.getPrevious('bulleted');

  void readPrevious;

  return {
    extension: {
      corrections: [
        {
          event: 'content',
          correct({ tx }) {
            const correctionRead: string =
              tx.unifiedList.getPrevious('bulleted');

            void correctionRead;
          },
        },
      ],
      onTransactionChange({ tx }) {
        const changeRead: string = tx.unifiedList.getPrevious('numbered');

        void changeRead;
      },
    },
    update: ({ tx }) => ({
      toggle: (initialState) =>
        `${store.get().prefix}:${tx.unifiedList.getPrevious(initialState.type)}`,
    }),
  };
});

const UnifiedListDependentPlugin = createBasePlugin({
  dependencies: [UnifiedListPlugin],
  key: 'unifiedListDependent',
}).extend(({ editor }) => {
  const dependencyRead: string =
    editor.read.unifiedList.getPrevious('bulleted');

  void dependencyRead;

  return {};
});

const unifiedListEditor = createBaseEditor({
  plugins: [UnifiedListDependentPlugin],
});
const unifiedListRead: string =
  unifiedListEditor.read.unifiedList.getPrevious('bulleted');
const unifiedListUpdate: string = unifiedListEditor.update.unifiedList.toggle({
  type: 'numbered',
});
unifiedListEditor.update((tx) => {
  const activeRead: string = tx.unifiedList.getPrevious('bulleted');

  void activeRead;
});
unifiedListEditor.read((state) =>
  state.transaction((tx) => {
    const specRead: string = tx.unifiedList.getPrevious('numbered');

    void specRead;
  })
);
// @ts-expect-error Read methods are not one-shot editor updates.
unifiedListEditor.update.unifiedList.getPrevious('bulleted');
const unifiedListPortal = unifiedListEditor.plugin(UnifiedListPlugin);
const unifiedListPortalRead: string =
  unifiedListPortal.read.getPrevious('bulleted');
const unifiedListPortalUpdate: string = unifiedListPortal.update.toggle({
  type: 'numbered',
});

void unifiedListPortalRead;
void unifiedListPortalUpdate;
void unifiedListRead;
void unifiedListUpdate;

const CalloutPlugin = createBasePlugin<CalloutConfig>({
  key: 'callout',
  initialState: {
    dismissible: false,
    variant: 'info',
  },
})
  .extend(({ store }) => ({
    extension: {
      api: {
        setVariant: (variant) => {
          store.set({ variant });
        },
      },
    },
  }))
  .extend(({ store }) => ({
    api: {
      getVariant: () => store.get().variant,
    },
  }));

const ConfiguredCalloutPlugin = CalloutPlugin.extend({
  initialState: {
    dismissible: true,
  },
})
  .extend({ extension: baseArrayExtension })
  .configure({
    initialState: {
      variant: 'warning',
    },
  });

CalloutPlugin.configure(({ store, plugin }) => {
  const configuredVariant: 'info' | 'warning' = store.get().variant;
  const configuredDismissible: boolean | undefined =
    plugin.initialState.dismissible;

  void configuredDismissible;
  void configuredVariant;

  return { initialState: { variant: 'warning' } };
});

const ShortcutTargetPlugin = createBasePlugin({
  key: 'shortcutTargetContracts',
  update: () => ({
    both: () => true,
    update: () => true,
  }),
}).extend(() => ({
  api: {
    api: () => true,
    both: () => true,
  },
}));

type DeclaredBaseTx = {
  run: (value: 'typed', initialState?: { count?: number }) => number;
};

const DeclaredBaseTxPlugin = createBasePlugin<
  PluginConfig<'declaredBaseTx', {}, {}, { declaredBaseTx: DeclaredBaseTx }>
>({
  key: 'declaredBaseTx',
  update: () => ({
    run: (value, initialState = {}) => {
      const exactValue: 'typed' = value;
      const exactCount: number | undefined = initialState.count;

      return exactValue.length + (exactCount ?? 0);
    },
  }),
});

void DeclaredBaseTxPlugin;

ShortcutTargetPlugin.extend({
  shortcuts: {
    api: { keys: 'mod+a' },
    both: { keys: 'mod+b', target: 'api' },
    custom: { handler: () => true, keys: 'mod+c' },
    update: { keys: 'mod+u' },
  },
});

const ShortcutApiScopeCollisionPlugin = ShortcutTargetPlugin.extend(() => ({
  extension: {
    api: {
      api: () => true,
    },
  },
}));

ShortcutApiScopeCollisionPlugin.extend({
  shortcuts: {
    // @ts-expect-error Plugin/editor API collisions require a custom handler.
    api: { keys: 'mod+a', target: 'api' },
  },
});

createBasePlugin<
  PluginConfig<
    'explicitShortcutContracts',
    {},
    {},
    { explicitShortcutContracts: { run: () => boolean } }
  >
>({
  key: 'explicitShortcutContracts',
  shortcuts: { run: { keys: 'mod+r' } },
});

ShortcutTargetPlugin.extend({
  shortcuts: {
    // @ts-expect-error Update/API collisions require an explicit target.
    both: { keys: 'mod+b' },
  },
});

ShortcutTargetPlugin.extend({
  shortcuts: {
    // @ts-expect-error Unknown commands require a custom handler.
    missing: { keys: 'mod+m' },
  },
});

ShortcutTargetPlugin.extend({
  shortcuts: {
    // @ts-expect-error API-only commands cannot target update.
    api: { keys: 'mod+a', target: 'update' },
  },
});

ShortcutTargetPlugin.extend({
  shortcuts: {
    // @ts-expect-error Custom handlers own routing and reject target.
    invalidHandlerTarget: {
      handler: () => true,
      keys: 'mod+i',
      target: 'api',
    },
  },
});

const FactoryExtensionPlugin = createBasePlugin({
  key: 'factoryExtension',
  initialState: {
    enabled: true,
  },
}).extend(({ store }) => {
  const enabled: boolean = store.get().enabled;

  void enabled;

  return { extension: [baseFactoryExtension] as const };
});

const FactoryStatePlugin = createBasePlugin({
  key: 'factoryState',
  initialState: ({ editor }) => ({
    enabled: editor.id.length > 0,
  }),
  read: ({ state }) => ({
    hasContent: () => state.children().length > 0,
  }),
});
const factoryStateEditor = createBaseEditor({
  plugins: [FactoryStatePlugin],
});
const factoryStatePlugin = factoryStateEditor.plugin(FactoryStatePlugin);
const factoryEnabled: boolean =
  factoryStateEditor.getPlugin(FactoryStatePlugin).initialState.enabled;
const factoryHasContent: boolean = factoryStatePlugin.read.hasContent();

void factoryEnabled;
void factoryHasContent;

createBasePlugin({
  key: 'contextualInput',
  initialState: {
    tone: 'warm' as const,
  },
  handlers: {
    onTextChange: ({ plugin, text }) => {
      const exactTone: 'warm' = plugin.initialState.tone;
      const nextText: string = text;

      void exactTone;
      void nextText;
    },
  },
  inject: {
    nodeProps: {
      transformProps: ({ plugin, props }) => {
        const exactTone: 'warm' = plugin.initialState.tone;

        void exactTone;

        return props;
      },
    },
  },
});

const InlineHistoryPlugin = createBasePlugin({
  key: 'inlineHistory',
  extension: history(),
});

const basePlateEditor = createBaseEditor({
  plugins: [BoldPlugin, ConfiguredCalloutPlugin, FactoryExtensionPlugin],
});

const inlineHistoryEditor = createBaseEditor({
  plugins: [InlineHistoryPlugin],
});

const coreHistoryEditor = createBaseEditor({
  plugins: [HistoryPlugin],
});

const OriginalOverridePlugin = createBasePlugin({
  key: 'originalOverride',
  extension: {
    api: {
      overrideLabel: () => 'original' as const,
      scopedLabel: () => 'scoped' as const,
    },
  },
}).extend(({ editor }) => {
  const rootLabel: 'original' = editor.api.overrideLabel();

  // @ts-expect-error root editor API arguments stay typed in plugin contexts
  editor.api.overrideLabel('invalid');

  void rootLabel;

  return {
    api: {
      pluginScopedLabel: () => 'plugin-scoped' as const,
    },
  };
});

const ReplacementOverridePlugin = createBasePlugin({
  dependencies: [OriginalOverridePlugin],
  key: 'replacementOverride',
}).extend(({ editor }) => ({
  extension: {
    api: {
      overrideLabel: () => `overridden:${editor.api.scopedLabel()}`,
    },
  },
}));

const overrideEditor = createBaseEditor({
  plugins: [OriginalOverridePlugin, ReplacementOverridePlugin],
});

const boldHotkey: string = basePlateEditor.api.toggleBold();
const boldEnabled: true = basePlateEditor
  .plugin(BoldPlugin)
  .store.get().enabled;
const calloutVariant: 'info' | 'warning' = basePlateEditor
  .plugin(ConfiguredCalloutPlugin)
  .store.get().variant;
const calloutDismissible: boolean | undefined = basePlateEditor
  .plugin(ConfiguredCalloutPlugin)
  .store.get().dismissible;
const calloutPluginVariant: 'info' | 'warning' =
  basePlateEditor.api.callout.getVariant();
const overrideLabel: string = overrideEditor.api.overrideLabel();
const scopedLabel: 'scoped' = overrideEditor.api.scopedLabel();
const portalPluginScopedLabel: 'plugin-scoped' = getEditorPlugin(
  overrideEditor,
  OriginalOverridePlugin
).api.pluginScopedLabel();
const rootPluginScopedLabel: 'plugin-scoped' =
  overrideEditor.api.originalOverride.pluginScopedLabel();
type OverrideEditorApiKeys = keyof typeof overrideEditor.api;
const originalOverrideApiKey: Extract<
  OverrideEditorApiKeys,
  'originalOverride'
> = 'originalOverride';
// @ts-expect-error descriptors do not expose an installed plugin portal
OriginalOverridePlugin.api.pluginScopedLabel();
// @ts-expect-error plugin-scoped API does not leak into editor.api
overrideEditor.api.pluginScopedLabel();

declare const extendedFullConfigApi: ExtendedFullConfig['api'];
declare const extendedFullConfigOptions: ExtendedFullConfig['initialState'];
declare const extendedFullConfigSelectors: ExtendedFullConfig['selectors'];
declare const extendedFullConfigState: NonNullable<ExtendedFullConfig['state']>;
declare const extendedFullConfigTx: ExtendedFullConfig['tx'];

const extendedFullBaseOption: true = extendedFullConfigOptions.baseOption;
const extendedFullExtraOption: 1 = extendedFullConfigOptions.extraOption;
const extendedFullBaseApi: 'base' = extendedFullConfigApi.baseApi();
const extendedFullExtraApi: 2 = extendedFullConfigApi.extraApi();
const extendedFullBaseSelector: boolean =
  extendedFullConfigSelectors.baseSelector();
const extendedFullExtraSelector: 3 =
  extendedFullConfigSelectors.extraSelector();
const extendedFullBaseState: 'base' = extendedFullConfigState.baseState;
const extendedFullExtraState: 4 = extendedFullConfigState.extraState;

extendedFullConfigTx.extendConfig.baseTx();
extendedFullConfigTx.extendConfig.extraTx('tx');

basePlateEditor.api.setVariant('info');
basePlateEditor.api.setVariant('warning');
inlineHistoryEditor.update((tx) => tx.history.undo());
inlineHistoryEditor.update({ history: 'skip' }, () => {});
coreHistoryEditor.update((tx) => tx.history.redo());
coreHistoryEditor.update({ history: 'merge' }, () => {});

void boldEnabled;
void boldHotkey;
void calloutDismissible;
void calloutPluginVariant;
void calloutVariant;
void originalOverrideApiKey;
void overrideLabel;
void portalPluginScopedLabel;
void rootPluginScopedLabel;
void scopedLabel;
void extendedFullBaseApi;
void extendedFullBaseOption;
void extendedFullBaseSelector;
void extendedFullBaseState;
void extendedFullExtraApi;
void extendedFullExtraOption;
void extendedFullExtraSelector;
void extendedFullExtraState;

// @ts-expect-error invalid configured option value
CalloutPlugin.configure({ initialState: { variant: 'danger' } });

// @ts-expect-error invalid merged editor api
basePlateEditor.api.notReal();

// @ts-expect-error wrong argument type for merged api
basePlateEditor.api.setVariant('danger');

// @ts-expect-error boolean option must stay boolean
basePlateEditor.plugin(BoldPlugin).store.get().enabled = 'yes';

// @ts-expect-error editor-level override APIs must not keep stale first-plugin literals
const staleOverrideLabel: 'original' = overrideEditor.api.overrideLabel();
void staleOverrideLabel;

const originalOverridePortalApi = getEditorPlugin(
  overrideEditor,
  OriginalOverridePlugin
).api;
// @ts-expect-error plugin portal API is scoped, not wrapped by plugin key
originalOverridePortalApi.originalOverride.pluginScopedLabel();

// @ts-expect-error selector extension must not land in the tx slot
extendedFullConfigTx.extendConfig.extraSelector();

// @ts-expect-error tx extension must not land in the selector slot
extendedFullConfigSelectors.extraTx('tx');
