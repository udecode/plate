import type { EditorApplicationSchema } from '@platejs/core';
import {
  createPlateEditor,
  definePlatePlugin,
  type PlateEditor,
} from '@platejs/core/react';
import {
  property,
  schema,
  target,
  type Element,
  type Text,
  type ValueOf,
} from '@platejs/plite';

import type { GeneratedEditorTypeProvider } from '../src/internal/editor/generatedEditorTypes';
import type { InferPlateEditorPlugins } from '../src/react/editor/PlateEditor';

type LayoutVariant = 'compact' | 'full';
type EditorSummary = `${LayoutVariant}:@`;
type LayoutPluginState = {
  density: 1 | 2;
  variant: LayoutVariant;
};

const layoutInitialState: LayoutPluginState = {
  density: 1,
  variant: 'full',
};

const LayoutPlugin = definePlatePlugin('layout', {
  api: ({ store }) => ({
    getVariant: () => store.get().variant,
  }),
  initialState: layoutInitialState,
  selectors: {
    isDense: (state) => state.density === 2,
  },
  schema: {
    properties: {
      align: schema.elementProperty(
        property.enum(['left', 'right'], { required: true }),
        { target: target.type('paragraph') }
      ),
    },
  },
  update: ({ tx }) => ({
    setDensity: (density: 1 | 2) => {
      tx.nodes.set({ density });
    },
  }),
});

const ConfiguredLayoutPlugin = LayoutPlugin.configure({
  initialState: {
    density: 2,
    variant: 'compact',
  },
});

const MentionPlugin = definePlatePlugin('mention', {
  api: ({ store }) => ({
    getTrigger: () => store.get().trigger,
  }),
  initialState: {
    trigger: '@' as const,
  },
});

const ToolbarPlugin = definePlatePlugin('toolbar', {
  api: () => ({
    describeToolbar: () => 'toolbar' as const,
  }),
  update: ({ tx }) => ({
    setCompact: () => {
      tx.nodes.set({ compact: true });
    },
  }),
});

const SharedPropertyPlugin = definePlatePlugin('sharedProperty', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
    properties: {
      blockValue: schema.elementProperty('sharedProperty', property.string(), {
        target: target.type('paragraph'),
      }),
    },
  },
  update: ({ tx }) => ({
    setBoolean: () => tx.nodes.set({ sharedProperty: true }),
    setDynamic: (properties: Readonly<Record<string, string>>) =>
      tx.nodes.set(properties),
    setString: () => tx.nodes.set({ sharedProperty: 'value' }),
    setWrongValue: () => {
      // @ts-expect-error one persisted key may have several declared placements, but its value must match one of them
      tx.nodes.set({ sharedProperty: 42 });
    },
  }),
});

void SharedPropertyPlugin;

const QuotePlugin = definePlatePlugin('quote', {
  schema: { element: schema.element.textBlock() },
});

QuotePlugin.extend({ shortcuts: { toggle: { keys: 'mod+shift+q' } } });

const CalloutPlugin = definePlatePlugin('calloutCapability', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        tone: property.enum(['info', 'warning'] as const, { required: true }),
      },
      type: 'callout_node',
    },
  },
});

const EditorPlugins = [
  ConfiguredLayoutPlugin,
  MentionPlugin,
  ToolbarPlugin,
  QuotePlugin,
] as const;

interface BodyText extends Text {
  text: string;
}

interface ParagraphElement extends Element {
  align: 'left' | 'right';
  children: readonly BodyText[];
  type: 'paragraph';
}

interface QuoteElement extends Element {
  citation?: string;
  children: readonly BodyText[];
  type: 'quote';
}

type BodyElement = ParagraphElement | QuoteElement;
type GeneratedBodyValue = ReadonlyArray<ParagraphElement | QuoteElement>;

type GeneratedEditorPlugins = typeof EditorPlugins &
  GeneratedEditorTypeProvider<{
    element: BodyElement;
    mutations: {
      paragraph: {
        construction: { align: 'left' | 'right' };
        properties: { align: 'left' | 'right' };
        toggle: true;
        type: 'paragraph';
      };
      quote: {
        construction: {};
        properties: { citation?: string };
        toggle: true;
        type: 'quote';
      };
    };
    schema: { plugins: {}; properties: {} };
    text: BodyText;
    value: GeneratedBodyValue;
  }>;

type EditorPluginNames = InferPlateEditorPlugins<typeof EditorPlugins>['name'];
const exactEditorPluginNames: string extends EditorPluginNames ? true : false =
  false;

type GeneratedEditor = PlateEditor<GeneratedEditorPlugins>;
type BodyValue = ValueOf<GeneratedEditor>;
type RawBodyValue = ValueOf<PlateEditor<typeof EditorPlugins>>;

const initialValue = [
  {
    align: 'left',
    children: [{ text: 'hello' }],
    type: 'paragraph',
  },
  {
    children: [{ text: 'world' }],
    type: 'quote',
  },
] satisfies BodyValue;

const plateEditor = createPlateEditor({
  plugins: EditorPlugins,
  initialValue,
});
const exactEditor = plateEditor as unknown as GeneratedEditor;

const rawValueStaysBroad: RawBodyValue = [
  { children: [{ text: 'raw' }], type: 'applicationNode' },
];

const expectBodyValue = (value: BodyValue) => value;

const bodyValue: BodyValue = initialValue;
const _runtimeValue = exactEditor.read.children();
const layoutVariant: LayoutVariant = exactEditor.api.layout.getVariant();
const mentionTrigger: '@' = exactEditor.api.mention.getTrigger();
const editorSummary: EditorSummary =
  `${exactEditor.api.layout.getVariant()}:${exactEditor.api.mention.getTrigger()}` as const;
const toolbarDescription: 'toolbar' = exactEditor.api.toolbar.describeToolbar();
const isDense: boolean = exactEditor
  .plugin(ConfiguredLayoutPlugin)
  .store.get('isDense');

exactEditor.update((tx) => {
  tx.plugin(ConfiguredLayoutPlugin).setDensity(1);
  tx.plugin('layout').setDensity(2);
  tx.layout.setDensity(1);
  tx.paragraph.set({ align: 'right' });
  tx.quote.remove();
  tx.quote.insert(
    {},
    {
      split: {
        match: (node) => {
          const citation: string | undefined = node.citation;

          return citation !== undefined;
        },
        type: QuotePlugin,
      },
    }
  );
  tx.layout.setDensity(2);
  tx.toolbar.setCompact();
  tx.nodes.remove({
    match: (node) => {
      const citation: string | undefined = node.citation;

      return citation === 'obsolete';
    },
    type: QuotePlugin,
  });
});
exactEditor.update.paragraph.insert({ align: 'left' });
exactEditor.update.paragraph.toggle();
exactEditor.update.quote.insert();
exactEditor.update.quote.insert(
  {},
  {
    split: {
      match: (node) => {
        const citation: string | undefined = node.citation;

        return citation !== undefined;
      },
      type: QuotePlugin,
    },
  }
);
exactEditor.update.quote.toggle({ at: [0] });
exactEditor.plugin(QuotePlugin).update.set({});
exactEditor.plugin(QuotePlugin).update.toggle();
exactEditor.update.nodes.set(
  { citation: 'source' },
  {
    match: (node) => {
      const citation: string | undefined = node.citation;

      return citation !== 'ignored';
    },
    type: QuotePlugin,
  }
);
// @ts-expect-error direct plugin selection uses final generated properties
exactEditor.update.nodes.set({ citation: 42 }, { type: QuotePlugin });

const rawElementEditor = createPlateEditor({ plugins: [CalloutPlugin] });
const rawCallout = rawElementEditor.plugin(CalloutPlugin);
const BooleanMarkPlugin = definePlatePlugin('booleanMark', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});
declare const broadPlateEditor: PlateEditor;

exactEditor.update.quote.insert(
  {},
  {
    split: {
      // @ts-expect-error mark-only plugins are not structural split selectors
      type: BooleanMarkPlugin,
    },
  }
);
exactEditor.update.quote.insert(
  {},
  {
    split: {
      // @ts-expect-error selector arrays cannot contain a mark-only plugin
      type: [QuotePlugin, BooleanMarkPlugin] as const,
    },
  }
);

rawCallout.update.insert({ tone: 'warning' });
rawCallout.update.set({ tone: 'info' });
rawCallout.update.remove();
// @ts-expect-error required-construction text blocks have no generic toggle
rawCallout.update.toggle({ at: [0] });
broadPlateEditor.update((tx) => {
  tx.plugin(LayoutPlugin).setDensity(1);
  tx.plugin(BooleanMarkPlugin).toggle();
});
// @ts-expect-error mark-only plugins are not structural node selectors
broadPlateEditor.update.nodes.remove({ type: BooleanMarkPlugin });

const VoidPlugin = definePlatePlugin('voidCapability', {
  schema: { element: { void: 'block' } },
});

VoidPlugin.extend({
  shortcuts: {
    // @ts-expect-error structural elements have no generic toggle command
    toggle: { keys: 'mod+shift+v' },
  },
});
const voidPortal = createPlateEditor({ plugins: [VoidPlugin] }).plugin(
  VoidPlugin
);

// @ts-expect-error void elements do not expose a generic block toggle
voidPortal.update.toggle();

const TextContentPlugin = definePlatePlugin('textContentCapability', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});
const textContentPortal = createPlateEditor({
  plugins: [TextContentPlugin],
}).plugin(TextContentPlugin);

textContentPortal.update.toggle();
createPlateEditor({
  plugins: [TextContentPlugin],
  schema: { id: 'identity-only', version: 1 },
})
  .plugin(TextContentPlugin)
  .update.toggle();

const OverriddenTextBlockPlugin = definePlatePlugin('overriddenTextBlock', {
  schema: { element: schema.element.textBlock() },
});
const StructuralChildPlugin = definePlatePlugin('structuralChild', {
  schema: { element: schema.element.textBlock() },
});
const overriddenPlugins = [
  OverriddenTextBlockPlugin,
  StructuralChildPlugin,
] as const;
type OverriddenGeneratedPlugins = typeof overriddenPlugins &
  GeneratedEditorTypeProvider<{
    element: Element;
    mutations: {
      overriddenTextBlock: {
        construction: {};
        properties: {};
        type: 'overriddenTextBlock';
      };
    };
    schema: { plugins: {}; properties: {} };
    text: Text;
    value: readonly Element[];
  }>;
const rawOverriddenEditor = createPlateEditor({
  plugins: overriddenPlugins,
  schema: {
    overrides: [
      schema.override(OverriddenTextBlockPlugin, {
        element: { content: schema.content.element(StructuralChildPlugin) },
      }),
    ],
  },
});
const rawOverriddenPortal = rawOverriddenEditor.plugin(
  OverriddenTextBlockPlugin
);

// @ts-expect-error application policy needs a generated contract for generic mutations
rawOverriddenPortal.update.toggle();
// @ts-expect-error application policy needs generated construction properties
rawOverriddenPortal.update.insert();

const rawRootPolicyEditor = createPlateEditor({
  plugins: overriddenPlugins,
  schema: {
    root: schema.content.element(OverriddenTextBlockPlugin, { min: 1 }),
  },
});

// @ts-expect-error application root policy needs a generated contract for grammar-dependent mutations
rawRootPolicyEditor.plugin(OverriddenTextBlockPlugin).update.toggle();

const invalidApplicationRoot: EditorApplicationSchema = {
  // @ts-expect-error an application root must state its non-empty minimum
  root: schema.content.element(OverriddenTextBlockPlugin),
};

void invalidApplicationRoot;

declare const useApplicationPolicy: boolean;
const conditionalPolicyEditor = createPlateEditor({
  plugins: overriddenPlugins,
  schema: useApplicationPolicy
    ? { id: 'conditional-policy', version: 1 }
    : {
        id: 'conditional-policy',
        overrides: [
          schema.override(OverriddenTextBlockPlugin, {
            element: {
              content: schema.content.element(StructuralChildPlugin),
            },
          }),
        ],
        version: 1,
      },
});

// @ts-expect-error any policy-bearing schema branch requires generated mutations
conditionalPolicyEditor.plugin(OverriddenTextBlockPlugin).update.toggle();

const overriddenEditor =
  rawOverriddenEditor as unknown as PlateEditor<OverriddenGeneratedPlugins>;
const overriddenPortal = overriddenEditor.plugin(OverriddenTextBlockPlugin);

// @ts-expect-error application overrides require generated mutation contracts
overriddenPortal.update.toggle();

expectBodyValue(bodyValue);

void editorSummary;
void exactEditorPluginNames;
void isDense;
void layoutVariant;
void mentionTrigger;
void rawValueStaysBroad;
void toolbarDescription;

LayoutPlugin.configure({
  initialState: {
    // @ts-expect-error invalid configured option value
    density: 3,
  },
});

exactEditor.update((tx) => {
  // @ts-expect-error invalid merged tx argument
  tx.layout.setDensity(3);
});

exactEditor.update((tx) => {
  // @ts-expect-error invalid merged toolbar tx argument
  tx.toolbar.setCompact(true);
});

exactEditor.update((tx) => {
  // @ts-expect-error uninstalled plugin names have no transaction capability
  tx.plugin('missingPlugin').run();
});

// @ts-expect-error required element construction property is missing
rawCallout.update.insert();

rawCallout.update.insert({
  // @ts-expect-error persisted element properties stay exact
  tone: 'error',
});

rawCallout.update.remove({
  // @ts-expect-error plugin-bound mutations do not accept another match
  type: 'paragraph',
});

// @ts-expect-error invalid selector arguments
exactEditor.plugin(ConfiguredLayoutPlugin).store.get('isDense', true);

// @ts-expect-error invalid merged editor api
exactEditor.api.toolbar.describeToolbar('extra');

const invalidBodyValue: BodyValue = [
  {
    align: 'left',
    children: [{ text: 'nope' }],
    // @ts-expect-error createPlateEditor value inference should stay narrow
    type: 'heading',
  },
  {
    children: [{ text: 'world' }],
    type: 'quote',
  },
];

void invalidBodyValue;
