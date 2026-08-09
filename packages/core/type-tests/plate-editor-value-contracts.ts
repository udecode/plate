import {
  property,
  schema,
  target,
  type Element,
  type Text,
  type ValueOf,
} from '@platejs/plite';
import {
  bindGeneratedEditor,
  defineEditor,
  type GeneratedEditorContract,
  type GeneratedEditorSchema,
  type GeneratedEditorTypes,
} from '@platejs/core';
import {
  createPlateEditor,
  definePlatePlugin,
  type PlateEditor,
} from '@platejs/core/react';
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

const QuotePlugin = definePlatePlugin('quote', {
  schema: { element: schema.element.textBlock() },
});

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
  children: readonly BodyText[];
  type: 'quote';
}

type BodyElement = ParagraphElement | QuoteElement;
type GeneratedBodyValue = readonly (ParagraphElement | QuoteElement)[];

const editorDefinition = defineEditor('contractEditor', {
  plugins: EditorPlugins,
});
const GeneratedEditorPlugins = bindGeneratedEditor(editorDefinition, {
  bindings: { plugins: {}, properties: {} },
  fingerprint: 'fnv1a64:contract',
  schema: {},
  types: undefined,
} as unknown as GeneratedEditorContract<
  GeneratedEditorTypes<
    GeneratedBodyValue,
    BodyElement,
    BodyText,
    GeneratedEditorSchema,
    {
      paragraph: {
        construction: { align: 'left' | 'right' };
        properties: { align: 'left' | 'right' };
        type: 'paragraph';
      };
      quote: {
        construction: {};
        properties: {};
        type: 'quote';
      };
    }
  >
>);

type EditorPluginNames = InferPlateEditorPlugins<typeof EditorPlugins>['name'];
const exactEditorPluginNames: string extends EditorPluginNames ? true : false =
  false;

type BodyValue = ValueOf<PlateEditor<typeof GeneratedEditorPlugins>>;
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
  plugins: GeneratedEditorPlugins,
  initialValue,
});

const rawValueStaysBroad: RawBodyValue = [
  { children: [{ text: 'raw' }], type: 'applicationNode' },
];

const expectBodyValue = (value: BodyValue) => value;

const bodyValue: BodyValue = initialValue;
const _runtimeValue = plateEditor.read.children();
const layoutVariant: LayoutVariant = plateEditor.api.layout.getVariant();
const mentionTrigger: '@' = plateEditor.api.mention.getTrigger();
const editorSummary: EditorSummary =
  `${plateEditor.api.layout.getVariant()}:${plateEditor.api.mention.getTrigger()}` as const;
const toolbarDescription: 'toolbar' = plateEditor.api.toolbar.describeToolbar();
const isDense: boolean = plateEditor
  .plugin(ConfiguredLayoutPlugin)
  .store.get('isDense');

plateEditor.update((tx) => {
  tx.layout.setDensity(1);
  tx.paragraph.set({ align: 'right' });
  tx.quote.remove();
  tx.layout.setDensity(2);
  tx.toolbar.setCompact();
});
plateEditor.update.paragraph.insert({ align: 'left' });
plateEditor.update.quote.insert();
plateEditor.plugin(QuotePlugin).update.set({});

const rawElementEditor = createPlateEditor({ plugins: [CalloutPlugin] });
const rawCallout = rawElementEditor.plugin(CalloutPlugin);

rawCallout.update.insert({ tone: 'warning' });
rawCallout.update.set({ tone: 'info' });
rawCallout.update.remove();

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

plateEditor.update((tx) => {
  // @ts-expect-error invalid merged tx argument
  tx.layout.setDensity(3);
});

plateEditor.update((tx) => {
  // @ts-expect-error invalid merged toolbar tx argument
  tx.toolbar.setCompact(true);
});

// @ts-expect-error required element construction property is missing
rawCallout.update.insert();

rawCallout.update.insert({
  // @ts-expect-error persisted element properties stay exact
  tone: 'error',
});

rawCallout.update.remove({
  // @ts-expect-error plugin-bound mutations do not accept another match
  match: { type: 'paragraph' },
});

// @ts-expect-error invalid selector arguments
plateEditor.plugin(ConfiguredLayoutPlugin).store.get('isDense', true);

// @ts-expect-error invalid merged editor api
plateEditor.api.toolbar.describeToolbar('extra');

const invalidBodyValue: BodyValue = [
  {
    align: 'left',
    children: [{ text: 'nope' }],
    // @ts-expect-error createPlateEditor value inference should stay narrow
    type: 'h1',
  },
  {
    children: [{ text: 'world' }],
    type: 'quote',
  },
];

void invalidBodyValue;
