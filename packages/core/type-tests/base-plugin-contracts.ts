// Core type contracts for base plugins and their editor extensions.
import {
  type DefinitionOf,
  HistoryPlugin,
  type RenderStaticNodeWrapper,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import {
  ContentSlice,
  createEditor,
  defineExtension,
  editorReads,
  property,
  schema,
  target,
} from '@platejs/plite';
import { type History, history } from '@platejs/plite-history';
import type { Paragraph as MdParagraph } from 'mdast';

import { toPlatePlugin } from '../src/react/plugin/toPlatePlugin';

type IsAny<T> = 0 extends 1 & T ? true : false;

const baseFactoryExtension = defineExtension('factoryExtension', {});
const baseReadExtension = defineExtension('baseReadExtensionOwner', {
  readMiddleware: ({ around }) => [
    around(editorReads.slice.export, ({ next }) => next()),
  ],
});

defineBasePlugin('baseReadExtensionOwner', {}).extend(baseReadExtension);

const MinimalDefinitionPlugin = defineBasePlugin('minimalDefinition', {});
type MinimalDefinition = DefinitionOf<typeof MinimalDefinitionPlugin>;
declare const minimalDefinition: MinimalDefinition;
const minimalDefinitionName: 'minimalDefinition' = minimalDefinition.name;
const minimalDefinitionOmitsApi: 'api' extends keyof MinimalDefinition
  ? false
  : true = true;

void minimalDefinitionName;
void minimalDefinitionOmitsApi;

const ConstructorDependencyPlugin = defineBasePlugin('constructorDependency', {
  api: () => ({ value: () => 1 as const }),
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});
const ConstructorInferencePlugin = defineBasePlugin('constructorInference', {
  api: ({ editor, store }) => ({
    value: () => {
      editor.extension(ConstructorDependencyPlugin).api.value() satisfies 1;
      void (store.get().mode satisfies 'busy' | 'idle');

      return 2 as const;
    },
  }),
  dependencies: [ConstructorDependencyPlugin],
  initialState: ({ editor }) => {
    editor.extension(ConstructorDependencyPlugin).api.value() satisfies 1;

    return {
      count: 0,
      mode: 'idle' as 'busy' | 'idle',
    };
  },
  schema: ({ initialState, plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: ConstructorDependencyPlugin,
        min: initialState.count,
      }),
    },
  }),
  shortcuts: {
    run: { keys: 'mod+r' },
  },
  update: ({ editor, store, tx }) => ({
    run: () => {
      editor.extension(ConstructorDependencyPlugin).api.value() satisfies 1;
      void (store.get().count satisfies number);
      void (tx satisfies object);

      return 3 as const;
    },
  }),
});
type ConstructorInferenceDefinition = DefinitionOf<
  typeof ConstructorInferencePlugin
>;
declare const constructorInferenceDefinition: ConstructorInferenceDefinition;
const constructorInferenceName: 'constructorInference' =
  constructorInferenceDefinition.name;
const constructorDependencyName: 'constructorDependency' =
  constructorInferenceDefinition.dependencies[0].name;
const constructorCount: number =
  constructorInferenceDefinition.initialState.count;
const constructorMode: 'busy' | 'idle' =
  constructorInferenceDefinition.initialState.mode;
const constructorSchemaContent =
  constructorInferenceDefinition.schema.element!.content;
const constructorShortcuts: true = constructorInferenceDefinition.shortcuts;
const constructorInferenceEditor = createBaseEditor({
  plugins: [ConstructorInferencePlugin],
});
const constructorApiResult: 2 =
  constructorInferenceEditor.api.constructorInference.value();
const constructorUpdateResult: 3 =
  constructorInferenceEditor.update.constructorInference.run();

void constructorApiResult;
void constructorCount;
void constructorDependencyName;
void constructorInferenceName;
void constructorSchemaContent;
void constructorMode;
void constructorShortcuts;
void constructorUpdateResult;

const AuthoredEmptyPlugin = defineBasePlugin('authoredEmpty', {
  api: () => ({}),
  conflicts: [],
  dependencies: [],
  initialState: {},
  read: () => ({}),
  selectors: {},
  shortcuts: {},
  targetPlugins: [],
  update: () => ({}),
});
type AuthoredEmptyDefinition = DefinitionOf<typeof AuthoredEmptyPlugin>;
declare const authoredEmptyDefinition: AuthoredEmptyDefinition;

void (authoredEmptyDefinition.api satisfies {});
void (authoredEmptyDefinition.conflicts satisfies readonly []);
void (authoredEmptyDefinition.dependencies satisfies readonly []);
void (authoredEmptyDefinition.initialState satisfies {});
void (authoredEmptyDefinition.read satisfies {});
void (authoredEmptyDefinition.selectors satisfies {});
void (authoredEmptyDefinition.shortcuts satisfies true);
void (authoredEmptyDefinition.targetPlugins satisfies readonly []);
void (authoredEmptyDefinition.update satisfies {});

const authoredBaseTargets = [MinimalDefinitionPlugin, 'heading'] as const;
const configuredBaseTargets = [ConstructorDependencyPlugin, 'toggle'] as const;
const AuthoredBaseTargetsPlugin = defineBasePlugin('authoredBaseTargets', {
  targetPlugins: authoredBaseTargets,
});
const ConfiguredBaseTargetsPlugin = AuthoredBaseTargetsPlugin.configure({
  targetPlugins: configuredBaseTargets,
});
type AuthoredBaseTargetsDefinition = DefinitionOf<
  typeof AuthoredBaseTargetsPlugin
>;
type ConfiguredBaseTargetsDefinition = DefinitionOf<
  typeof ConfiguredBaseTargetsPlugin
>;
declare const authoredBaseTargetsDefinition: AuthoredBaseTargetsDefinition;
declare const configuredBaseTargetsDefinition: ConfiguredBaseTargetsDefinition;
const exactAuthoredBaseTargets: readonly [
  typeof MinimalDefinitionPlugin,
  'heading',
] = authoredBaseTargetsDefinition.targetPlugins;
const exactConfiguredBaseTargets: readonly [
  typeof MinimalDefinitionPlugin,
  'heading',
] = configuredBaseTargetsDefinition.targetPlugins;
// @ts-expect-error Configuration does not rewrite the authored definition witness.
const invalidConfiguredBaseTarget: typeof ConstructorDependencyPlugin =
  configuredBaseTargetsDefinition.targetPlugins[0];

void exactAuthoredBaseTargets;
void exactConfiguredBaseTargets;
void invalidConfiguredBaseTarget;

defineBasePlugin('candidateValidation', {
  validate: (context) => {
    const candidateName: string = context.name;

    // @ts-expect-error Validation receives the candidate context, not plugin configuration.
    void context.config;
    void candidateName;
  },
});

defineBasePlugin('readFactoryBoundary', {
  read: (context) => {
    // @ts-expect-error Read middleware registration belongs in readMiddleware.
    void context.around;

    return {};
  },
});

const BoldPlugin = defineBasePlugin('bold', {
  api: ({ store }) => ({
    toggleBold: () => store.get().hotkey,
  }),
  initialState: {
    enabled: true as const,
    hotkey: 'mod+b',
  },
});

const CodecContractPlugin = defineBasePlugin('codecContract', {
  codecs: ({ defineCodecs, editor, plugin }) =>
    defineCodecs({
      'application/x-codec-contract': {
        scope: 'document',
        decode: ({ data, format, source, state }) => {
          const exactData: string = data;
          const exactEditorId: string = editor.id;
          const exactFormat: string = format;
          const exactName: 'codecContract' = plugin.name;
          const exactSchema: object = state.schema;
          const exactTypes: readonly string[] = source.types;

          void exactData;
          void exactEditorId;
          void exactFormat;
          void exactName;
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

const MarkdownCodecContractPlugin = defineBasePlugin('markdownCodecContract', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        align: property.string(),
      },
    },
  },
  codecs: ({ defineCodecs, schema }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'p' }),
        match: [{ tag: 'p' }],
      },
      'text/markdown': {
        decode: ({ node }) => {
          const exactSource: MdParagraph = node;
          const sourceIsAny: IsAny<typeof node> = false;
          const targetType: string = schema.type;

          void exactSource;
          void sourceIsAny;
          void targetType;

          // @ts-expect-error Paragraph source discriminants stay exact.
          const headingSourceType: 'heading' = node.type;
          void headingSourceType;

          return {
            align: 'left',
            children: [{ text: '' }],
            type: schema.type,
          };
        },
        encode: ({ node }) => {
          const exactAlign: string | undefined = node.align;
          const exactType: string = node.type;
          const targetIsAny: IsAny<typeof node> = false;

          void exactAlign;
          void exactType;
          void targetIsAny;

          // @ts-expect-error Schema-owned align stays string-valued.
          const numericAlign: number | undefined = node.align;
          void numericAlign;

          return { children: [], type: 'paragraph' };
        },
        from: 'paragraph',
        kind: 'node',
      },
    }),
});

void MarkdownCodecContractPlugin;

const MarkdownSchemaFactoryParagraphPlugin = defineBasePlugin(
  'markdownSchemaFactoryParagraph',
  {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  }
);

const MarkdownSchemaFactoryCodecContractPlugin = defineBasePlugin(
  'markdownSchemaFactoryCodecContract',
  {
    schema: ({ plugins }) => ({
      element: {
        content: plugins.blockContent({
          default: MarkdownSchemaFactoryParagraphPlugin,
          min: 1,
        }),
        properties: {
          align: property.string(),
        },
      },
    }),
    codecs: ({ defineCodecs, schema }) =>
      defineCodecs({
        'text/html': {
          decode: () => ({}),
          encode: ({ content, node }) => {
            const contentIsAny: IsAny<typeof content> = false;
            const exactAlign: string | undefined = node.align;
            const targetIsAny: IsAny<typeof node> = false;

            void contentIsAny;
            void exactAlign;
            void targetIsAny;

            // @ts-expect-error Schema-owned align stays string-valued.
            const numericAlign: number | undefined = node.align;
            void numericAlign;

            return { children: content, tag: 'p' };
          },
          match: [{ tag: 'p' }],
        },
        'text/markdown': {
          decode: ({ node }) => {
            const exactSource: MdParagraph = node;
            const sourceIsAny: IsAny<typeof node> = false;
            const targetType: string = schema.type;

            void exactSource;
            void sourceIsAny;
            void targetType;

            // @ts-expect-error Paragraph source discriminants stay exact.
            const headingSourceType: 'heading' = node.type;
            void headingSourceType;

            return {
              align: 'left',
              children: [{ text: '' }],
              type: schema.type,
            };
          },
          encode: ({ node }) => {
            const exactAlign: string | undefined = node.align;
            const exactType: string = node.type;
            const targetIsAny: IsAny<typeof node> = false;

            void exactAlign;
            void exactType;
            void targetIsAny;

            // @ts-expect-error Schema-owned align stays string-valued.
            const numericAlign: number | undefined = node.align;
            void numericAlign;

            return { children: [], type: 'paragraph' };
          },
          from: 'paragraph',
          kind: 'node',
        },
      }),
  }
);

void MarkdownSchemaFactoryCodecContractPlugin;

const MarkdownMarkCodecContractPlugin = defineBasePlugin(
  'markdownMarkCodecContract',
  {
    schema: { mark: property.string() },
    codecs: ({ defineCodecs, schema }) =>
      defineCodecs({
        'text/html': {
          decode: ({ element }) => element.style.color || undefined,
          encode: ({ value }) => ({
            style: { color: value },
            tag: 'span',
          }),
          match: [{ style: { color: '*' } }],
        },
        'text/markdown': {
          decode: ({ decode, decoration, node }) =>
            decode(node.children, {
              ...decoration,
              [schema.key]: 'red',
            }),
          encode: ({ node }) => ({
            attributes: [],
            children: [{ type: 'text', value: node.text }],
            name: 'span',
            type: 'mdxJsxTextElement',
          }),
          from: 'span',
          kind: 'node',
          mark: true,
        },
      }),
  }
);

void MarkdownMarkCodecContractPlugin;

const HtmlParagraphContractPlugin = defineBasePlugin('htmlParagraphContract', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
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
          const exactType: 'htmlParagraphContract' = node.type;

          void exactType;

          return { children: content, tag: 'p' };
        },
        match: [{ tag: 'p' }],
      },
    }),
});

type StaticWrapperPluginState = {
  label?: string;
};

const erasedStaticWrapper: RenderStaticNodeWrapper = ({ element }) =>
  element ? ({ children }) => children : null;

const StaticWrapperPlugin = defineBasePlugin('staticWrapper', {
  initialState: (): StaticWrapperPluginState => ({}),
  schema: () => ({
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  }),
});

StaticWrapperPlugin.configure({
  render: {
    belowNodes: erasedStaticWrapper,
  },
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
  const Base = defineBasePlugin('schemaCreationOnly', {});

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
  const Target = defineBasePlugin('foreignTarget', {
    schema: { mark: property.boolean() },
  });

  const Owner = defineBasePlugin('foreignTargetOwner', {
    codecs: ({ defineCodecs }) =>
      defineCodecs(Target, {
        'text/html': {
          decode: () => true,
          decodeOnly: true,
          match: [{ tag: 'strong' }],
        },
      }),
  });

  void Owner;
};

void assertForeignHtmlTarget;

const HtmlBoldContractPlugin = defineBasePlugin('htmlBoldContract', {
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

defineBasePlugin('rawHtmlCodecContract', {
  // @ts-expect-error Codec declarations must be branded by defineCodecs. @plate-schema-adoption-negative-codec
  codecs: () => ({
    'text/html': {
      decode: () => true,
      decodeOnly: true,
      match: [{ tag: 'strong' }],
    },
  }),
});

defineBasePlugin('tupleHtmlCodecContract', {
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

defineBasePlugin('invalidHtmlMarkOutput', {
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

const HtmlAlignContractPlugin = defineBasePlugin('htmlAlignContract', {
  schema: {
    properties: {
      align: schema.elementProperty(property.string(), {
        target: target.type('htmlParagraphContract'),
      }),
    },
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

defineBasePlugin('invalidHtmlPropertyOutput', {
  schema: {
    properties: {
      align: schema.elementProperty(property.string(), {
        target: target.type('htmlParagraphContract'),
      }),
    },
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

const HtmlListContractPlugin = defineBasePlugin('htmlListContract', {
  schema: {
    properties: {
      listStart: schema.elementProperty(property.number(), {
        target: target.type('htmlParagraphContract'),
      }),
      listStyle: schema.elementProperty(property.string(), {
        target: target.type('htmlParagraphContract'),
      }),
    },
  },
  targetPlugins: [HtmlParagraphContractPlugin],
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

          // @ts-expect-error A target-name list can resolve more than one element type.
          const stalePrimaryType: 'htmlParagraphContract' = node.type;

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

const HtmlMixedListContractPlugin = defineBasePlugin('htmlMixedListContract', {
  schema: {
    properties: {
      listStart: schema.elementProperty(property.number(), {
        target: target.type('htmlParagraphContract'),
      }),
      listStyle: schema.elementProperty(property.string(), {
        target: target.type('htmlParagraphContract'),
      }),
    },
  },
  targetPlugins: [HtmlParagraphContractPlugin],
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': [
        {
          createsElement: true,
          decode: ({ element }) => ({
            listStart: Number(element.getAttribute('start')) || undefined,
            listStyle: element.tagName === 'OL' ? 'decimal' : 'disc',
          }),
          encode: ({ content, node }) => ({
            children: content,
            tag: node.listStyle === 'decimal' ? 'ol' : 'ul',
          }),
          match: [{ tag: ['ol', 'ul'] }],
        },
        {
          decode: ({ element }) => ({
            listStart: undefined,
            listStyle: element.dataset.listStyle,
          }),
          decodeOnly: true,
          match: [{ attributes: { 'data-list-style': true } }],
        },
      ],
    }),
});

void HtmlMixedListContractPlugin;

const PrefixHtmlContractPlugin = defineBasePlugin('prefixHtmlContract', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      // @ts-expect-error HTML codecs require exact owned schema-property keys.
      'text/html': {
        decode: () => ({}),
        decodeOnly: true,
        match: [{ tag: 'p' }],
      },
    }),
  schema: {
    properties: {
      data: schema.elementProperty(
        schema.key.prefix('data-'),
        property.string(),
        {
          target: target.type('htmlParagraphContract'),
        }
      ),
    },
  },
});

void PrefixHtmlContractPlugin;

const ConfiguredHtmlForeignTarget = defineBasePlugin(
  'configuredHtmlForeignTarget',
  {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: { variant: property.string() },
      },
    },
  }
).configure({});

const HtmlForeignContractPlugin = defineBasePlugin('htmlForeignContract', {
  codecs: ({ defineCodecs }) =>
    defineCodecs(ConfiguredHtmlForeignTarget, {
      'text/html': {
        decode: ({ element }) => ({ variant: element.dataset.variant }),
        encode: ({ content, node }) => {
          const exactType: 'configuredHtmlForeignTarget' = node.type;
          const exactVariant: string | undefined = node.variant;

          void exactType;
          void exactVariant;

          return { children: content, tag: 'aside' };
        },
        match: [{ tag: 'aside' }],
      },
    }),
});

void HtmlForeignContractPlugin;

defineBasePlugin('invalidForeignCreatesElement', {
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

defineBasePlugin('arrayCodecContract', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'application/x-array-contract': {
        // @ts-expect-error Codec decode returns an exact ContentSlice, never an array.
        decode: () => [{ text: 'invalid' }],
        scope: 'document',
      },
    }),
});

const manualIdentityCodec = {
  'application/x-identity-contract': {
    decode: () => null,
    owner: 'manual',
    scope: 'document',
  },
} as const;

defineBasePlugin('identityCodecContract', {
  codecs: ({ defineCodecs }) =>
    // @ts-expect-error Codec owner identity is inferred from the plugin.
    defineCodecs(manualIdentityCodec),
});

defineBasePlugin('invalidGenericHtmlContract', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      // @ts-expect-error Generic product codecs cannot claim text/html.
      'text/html': {
        decode: () => null,
        scope: 'document',
      },
    }),
});

defineBasePlugin('documentMarkdownCodecContract', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        decode: ({ data }) => ContentSlice.closed([{ text: data }]),
        scope: 'document',
      },
    }),
});

defineBasePlugin('invalidUnscopedMarkdownCodecContract', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      // @ts-expect-error Document Markdown codecs require document scope.
      'text/markdown': {
        decode: ({ data }) => ContentSlice.closed([{ text: data }]),
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

const UnifiedListPlugin = defineBasePlugin('unifiedList', {
  initialState: {
    prefix: 'list' as const,
  },
  read: ({ state }) => ({
    getPrevious: (type: 'bulleted' | 'numbered') =>
      `list:${state.children().length}:${type}`,
  }),
}).extend(({ store, read }) => {
  const readPrevious: string = read.getPrevious('bulleted');

  void readPrevious;

  return {
    corrections: [
      {
        event: 'content',
        correct({ tx }) {
          const correctionRead: string = tx.unifiedList.getPrevious('bulleted');

          void correctionRead;
        },
      },
    ],
    on: {
      transactionChange({ tx }) {
        const changeRead: string = tx.unifiedList.getPrevious('numbered');

        void changeRead;
      },
    },
    update: ({ tx }) => ({
      toggle: (options: { type: 'bulleted' | 'numbered' }) =>
        `${store.get().prefix}:${tx.unifiedList.getPrevious(options.type)}`,
    }),
  };
});

const UnifiedListDependentPlugin = defineBasePlugin('unifiedListDependent', {
  dependencies: [UnifiedListPlugin],
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

type CalloutPluginState = {
  dismissible?: boolean;
  variant: 'info' | 'warning';
};

const calloutInitialState: CalloutPluginState = {
  dismissible: false,
  variant: 'info',
};

const CalloutPlugin = defineBasePlugin('callout', {
  api: ({ store }) => ({
    getVariant: () => store.get().variant,
    setVariant: (variant: 'info' | 'warning') => {
      store.set({ variant });
    },
  }),
  initialState: calloutInitialState,
});

const ConfiguredCalloutPlugin = CalloutPlugin.configure({
  initialState: {
    dismissible: true,
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

const ShortcutTargetPlugin = defineBasePlugin('shortcutTargetContracts', {
  api: () => ({
    api: () => true,
    both: () => true,
  }),
  update: () => ({
    both: () => true,
    update: () => true,
  }),
});

const DeclaredBaseTxPlugin = defineBasePlugin('declaredBaseTx', {
  update: () => ({
    run: (value: 'typed', initialState: { count?: number } = {}) => {
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

defineBasePlugin('explicitShortcutContracts', {
  update: () => ({ run: () => true }),
}).extend({
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
    // @ts-expect-error Custom shortcut callbacks own routing and reject target.
    invalidHandlerTarget: {
      handler: () => true,
      keys: 'mod+i',
      target: 'api',
    },
  },
});

const FactoryExtensionPlugin = defineBasePlugin('factoryExtension', {
  initialState: {
    enabled: true,
  },
})
  .extend(baseFactoryExtension)
  .extend(({ store }) => {
    const enabled: boolean = store.get().enabled;

    void enabled;

    return {};
  });

const FactoryStatePlugin = defineBasePlugin('factoryState', {
  initialState: ({ editor }): { enabled: boolean } => ({
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
  factoryStateEditor.plugin(FactoryStatePlugin).initialState.enabled;
const factoryHasContent: boolean = factoryStatePlugin.read.hasContent();

void factoryEnabled;
void factoryHasContent;

defineBasePlugin('contextualInput', {
  initialState: {
    tone: 'warm' as const,
  },
  on: {
    textChange: ({ plugin, text }) => {
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

const InlineHistoryPlugin = defineBasePlugin('inlineHistory', {})
  .extend(history())
  .extend(({ read }) => {
    read.undos() satisfies readonly unknown[];

    return {
      api: () => ({
        undoCount: () => read.undos().length,
      }),
    };
  });

type CustomHistoryValue = readonly [
  {
    children: readonly [{ text: string }];
    type: 'custom-history';
  },
];

const basePlateEditor = createBaseEditor({
  plugins: [BoldPlugin, ConfiguredCalloutPlugin, FactoryExtensionPlugin],
});

const inlineHistoryEditor = createBaseEditor({
  plugins: [InlineHistoryPlugin],
});
const customHistoryEditor = createBaseEditor({
  editor: createEditor<CustomHistoryValue>(),
  initialValue: [
    {
      children: [{ text: '' }],
      type: 'custom-history',
    },
  ],
  plugins: [InlineHistoryPlugin],
});
const customHistory: History<CustomHistoryValue> =
  customHistoryEditor.read.history();

const coreHistoryEditor = createBaseEditor({
  plugins: [HistoryPlugin],
});

const OriginalOverridePlugin = defineBasePlugin('originalOverride', {
  api: () => ({
    overrideLabel: () => 'original' as const,
    scopedLabel: () => 'scoped' as const,
  }),
}).extend(({ api }) => {
  const rootLabel: 'original' = api.overrideLabel();

  // @ts-expect-error staged plugin API arguments stay typed in plugin contexts
  api.overrideLabel('invalid');

  void rootLabel;

  return {
    api: () => ({
      pluginScopedLabel: () => 'plugin-scoped' as const,
    }),
  };
});

const ResolvedOverrideContextPlugin = defineBasePlugin(
  'resolvedOverrideContext',
  {}
).extend(({ plugin }) => {
  const overrideIsAny: IsAny<typeof plugin.override> = false;
  const components: object | undefined = plugin.override.components;
  const pluginOverrides: Record<string, object> | undefined =
    plugin.override.plugins;

  void components;
  void overrideIsAny;
  void pluginOverrides;

  return {};
});

const ReplacementOverridePlugin = defineBasePlugin('replacementOverride', {
  api: ({ editor }) => ({
    overrideLabel: () =>
      `overridden:${editor.api.originalOverride.scopedLabel()}`,
  }),
  dependencies: [OriginalOverridePlugin],
});

const overrideEditor = createBaseEditor({
  plugins: [OriginalOverridePlugin, ReplacementOverridePlugin],
});

const boldHotkey: string = basePlateEditor.api.bold.toggleBold();
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
const overrideLabel: string =
  overrideEditor.api.replacementOverride.overrideLabel();
const scopedLabel: 'scoped' = overrideEditor.api.originalOverride.scopedLabel();
const portalPluginScopedLabel: 'plugin-scoped' = overrideEditor
  .plugin(OriginalOverridePlugin)
  .api.pluginScopedLabel();
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

const ExtendedFullPlugin = defineBasePlugin('extendFull', {
  api: () => ({ baseApi: () => 'base' as const }),
  initialState: { baseOption: true as const },
  read: () => ({ baseRead: () => 'base-read' as const }),
  selectors: { baseSelector: () => true },
  update: () => ({ baseUpdate: () => 'base-update' as const }),
}).extend(({ api, read }) => ({
  api: () => ({
    extraApi: () => `${api.baseApi()}:extra` as const,
  }),
  initialState: { extraOption: 1 as const },
  read: () => ({
    extraRead: () => `${read.baseRead()}:extra` as const,
  }),
  selectors: { extraSelector: () => 3 as const },
  update: ({ tx }) => ({
    extraUpdate: (value: 'update') =>
      `${tx.extendFull.baseUpdate()}:${value}` as const,
  }),
}));
type ExtendedFullDefinition = DefinitionOf<typeof ExtendedFullPlugin>;
declare const extendedFullDefinition: ExtendedFullDefinition;
const extendedFullName: 'extendFull' = extendedFullDefinition.name;
const extendedFullEditor = createBaseEditor({
  plugins: [ExtendedFullPlugin],
});
const extendedFullBaseOption: true = extendedFullEditor
  .plugin(ExtendedFullPlugin)
  .store.get().baseOption;
const extendedFullExtraOption: 1 = extendedFullEditor
  .plugin(ExtendedFullPlugin)
  .store.get().extraOption;
const extendedFullBaseApi: 'base' = extendedFullEditor.api.extendFull.baseApi();
const extendedFullExtraApi: 'base:extra' =
  extendedFullEditor.api.extendFull.extraApi();
const extendedFullBaseRead: 'base-read' =
  extendedFullEditor.read.extendFull.baseRead();
const extendedFullExtraRead: 'base-read:extra' =
  extendedFullEditor.read.extendFull.extraRead();
const extendedFullBaseSelector: boolean = extendedFullEditor
  .plugin(ExtendedFullPlugin)
  .store.get('baseSelector');
const extendedFullExtraSelector: 3 = extendedFullEditor
  .plugin(ExtendedFullPlugin)
  .store.get('extraSelector');
const extendedFullExtraUpdate: 'base-update:update' =
  extendedFullEditor.update.extendFull.extraUpdate('update');

basePlateEditor.api.callout.setVariant('info');
basePlateEditor.api.callout.setVariant('warning');
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
void customHistory;
void overrideLabel;
void portalPluginScopedLabel;
void rootPluginScopedLabel;
void ResolvedOverrideContextPlugin;
void scopedLabel;
void extendedFullName;
void extendedFullBaseApi;
void extendedFullBaseOption;
void extendedFullBaseRead;
void extendedFullBaseSelector;
void extendedFullExtraApi;
void extendedFullExtraOption;
void extendedFullExtraRead;
void extendedFullExtraSelector;
void extendedFullExtraUpdate;

// @ts-expect-error invalid configured option value
CalloutPlugin.configure({ initialState: { variant: 'danger' } });

// @ts-expect-error invalid merged editor api
basePlateEditor.api.notReal();

// @ts-expect-error wrong argument type for merged api
basePlateEditor.api.callout.setVariant('danger');

// @ts-expect-error boolean option must stay boolean
basePlateEditor.plugin(BoldPlugin).store.get().enabled = 'yes';

// @ts-expect-error consumer portals do not expose callback-only editor context
void basePlateEditor.plugin(BoldPlugin).editor;

// @ts-expect-error consumer portals do not expose codec authoring helpers
void basePlateEditor.plugin(BoldPlugin).defineCodecs;

const originalOverridePortalApi = overrideEditor.plugin(
  OriginalOverridePlugin
).api;
// @ts-expect-error plugin portal API is scoped, not wrapped by plugin name
originalOverridePortalApi.originalOverride.pluginScopedLabel();

// @ts-expect-error selectors stay in the plugin store, not update
extendedFullEditor.update.extendFull.extraSelector();

// @ts-expect-error update methods stay out of the plugin store
extendedFullEditor.plugin(ExtendedFullPlugin).store.get('extraUpdate');
