import type { PluginConfig } from '@platejs/core';
import {
  createPlateEditor,
  createPlatePlugin,
  createTPlatePlugin,
} from '@platejs/core/react';

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
  {},
  {
    isDense: () => boolean;
  },
  {
    layout: {
      setDensity: (density: 1 | 2) => void;
    };
  }
>;

const LayoutPlugin = createTPlatePlugin<LayoutConfig>({
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
  .extendTx(({ plugin }) => () => ({
    setDensity: (density) => {
      plugin.options.density = density;
    },
  }));

const ConfiguredLayoutPlugin = LayoutPlugin.configure({
  options: {
    variant: 'compact',
  },
}).extend({
  options: {
    density: 2,
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
  .extendEditorApi(({ editor }) => ({
    describeEditor: () =>
      `${editor.getPluginApi(LayoutPlugin).getVariant()}:${editor.getPluginApi(MentionPlugin).getTrigger()}` as EditorSummary,
  }))
  .extendTx(({ editor }) => () => ({
    setCompact: () => {
      editor.update((tx) => tx.layout.setDensity(1));
    },
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
  value: initialValue,
});

const expectBodyValue = (value: BodyValue) => value;

const bodyValue: BodyValue = plateEditor.children;
const layoutVariant: LayoutVariant = plateEditor.api.getVariant();
const mentionTrigger: '@' = plateEditor.api.getTrigger();
const editorSummary: EditorSummary = plateEditor.api.describeEditor();
const isDense: boolean = plateEditor.getOption(
  ConfiguredLayoutPlugin,
  'isDense'
);

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

ConfiguredLayoutPlugin.configure({
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
plateEditor.getOption(ConfiguredLayoutPlugin, 'isDense', true);

// @ts-expect-error invalid merged editor api
plateEditor.api.describeEditor('extra');

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
