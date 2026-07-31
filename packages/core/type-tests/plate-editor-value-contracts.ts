import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';

type BodyValue = [
  {
    align: 'left' | 'right';
    children: [{ text: string }];
    type: 'p';
  },
  {
    children: [{ text: string }];
    type: 'quote';
  },
];
type ReadBodyValue = readonly [...BodyValue];

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

const LayoutPlugin = createPlatePlugin({
  api: ({ store }) => ({
    getVariant: () => store.get().variant,
  }),
  name: 'layout',
  initialState: layoutInitialState,
  selectors: {
    isDense: (state) => state.density === 2,
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

const MentionPlugin = createPlatePlugin({
  api: ({ store }) => ({
    getTrigger: () => store.get().trigger,
  }),
  name: 'mention',
  initialState: {
    trigger: '@' as const,
  },
});

const ToolbarPlugin = createPlatePlugin({
  api: () => ({
    describeToolbar: () => 'toolbar' as const,
  }),
  name: 'toolbar',
  update: ({ tx }) => ({
    setCompact: () => {
      tx.nodes.set({ compact: true });
    },
  }),
});

const initialValue = [
  {
    align: 'left',
    children: [{ text: 'hello' }],
    type: 'p',
  },
  {
    children: [{ text: 'world' }],
    type: 'quote',
  },
] satisfies BodyValue;

const plateEditor = createPlateEditor({
  plugins: [ConfiguredLayoutPlugin, MentionPlugin, ToolbarPlugin],
  initialValue,
});

const expectBodyValue = (value: ReadBodyValue) => value;

const bodyValue: ReadBodyValue = plateEditor.read.children();
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
  tx.layout.setDensity(2);
  tx.toolbar.setCompact();
});

expectBodyValue(bodyValue);

void editorSummary;
void isDense;
void layoutVariant;
void mentionTrigger;
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
