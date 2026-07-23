import type { PluginConfig } from '@platejs/core';
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

type LayoutConfig = PluginConfig<
  'layout',
  {
    density: 1 | 2;
    variant: LayoutVariant;
  },
  {
    getVariant: () => LayoutVariant;
  },
  {
    layout: {
      setDensity: (density: 1 | 2) => void;
    };
  },
  {
    isDense: () => boolean;
  }
>;

const LayoutPlugin = createPlatePlugin<LayoutConfig>({
  key: 'layout',
  options: {
    density: 1,
    variant: 'full',
  },
})
  .extendSelectors(({ getOptions }) => ({
    isDense: () => getOptions().density === 2,
  }))
  .extendEditorApi(({ getOptions }) => ({
    getVariant: () => getOptions().variant,
  }))
  .extendTx(({ setOption }) => () => ({
    setDensity: (density) => {
      setOption('density', density);
    },
  }));

const ConfiguredLayoutPlugin = LayoutPlugin.extend({
  options: {
    density: 2,
  },
}).configure({
  options: {
    variant: 'compact',
  },
});

const MentionPlugin = createPlatePlugin({
  key: 'mention',
  options: {
    trigger: '@' as const,
  },
}).extendEditorApi(({ getOptions }) => ({
  getTrigger: () => getOptions().trigger,
}));

const ToolbarPlugin = createPlatePlugin({
  key: 'toolbar',
})
  .extendEditorApi(() => ({
    describeToolbar: () => 'toolbar' as const,
  }))
  .extendTx(() => () => ({
    setCompact: () => undefined,
  }));

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
const layoutVariant: LayoutVariant = plateEditor.api.getVariant();
const mentionTrigger: '@' = plateEditor.api.getTrigger();
const editorSummary: EditorSummary =
  `${plateEditor.api.getVariant()}:${plateEditor.api.getTrigger()}` as const;
const toolbarDescription: 'toolbar' = plateEditor.api.describeToolbar();
const isDense: boolean = plateEditor
  .plugin(ConfiguredLayoutPlugin)
  .getOption('isDense');

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
  options: {
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
plateEditor.plugin(ConfiguredLayoutPlugin).getOption('isDense', true);

// @ts-expect-error invalid merged editor api
plateEditor.api.describeToolbar('extra');

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
