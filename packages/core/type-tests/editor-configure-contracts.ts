import type { PluginConfig } from '@platejs/core';
import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';

type ChildConfig = PluginConfig<
  'child',
  {
    level: 1 | 2;
  },
  {
    plugin: {
      getLevel: () => 1 | 2;
    };
    setLevel: (level: 1 | 2) => void;
  }
>;

const ChildPlugin = createBasePlugin<ChildConfig>({
  key: 'child',
  options: {
    level: 1,
  },
}).extendEditorApi(({ plugin }) => ({
  plugin: {
    getLevel: () => plugin.options.level,
  },
  setLevel: (level) => {
    plugin.options.level = level;
  },
}));

const ParentPlugin = createBasePlugin({
  key: 'parent',
  plugins: [ChildPlugin],
}).configurePlugin(ChildPlugin, {
  options: {
    level: 2,
  },
});

const basePlateEditor = createBaseEditor({
  plugins: [ParentPlugin],
});

type DisplayConfig = PluginConfig<
  'display',
  {
    label: 'body' | 'title';
  },
  {
    getLabel: () => 'body' | 'title';
  }
>;

const DisplayPlugin = createPlatePlugin<DisplayConfig>({
  key: 'display',
  options: {
    label: 'title',
  },
}).extendEditorApi(({ getOptions }) => ({
  getLabel: () => getOptions().label,
}));

const plateEditor = createPlateEditor({
  plugins: [DisplayPlugin],
  value: [{ children: [{ text: 'hello' }], type: 'p' }] as [
    { children: [{ text: string }]; type: 'p' },
  ],
});

const nestedLevel: 1 | 2 = basePlateEditor
  .plugin(ChildPlugin)
  .getOptions().level;
const nestedApiLevel: 1 | 2 = basePlateEditor.api.plugin.getLevel();
const plateValue: readonly [{ children: [{ text: string }]; type: 'p' }] =
  plateEditor.read.children();
const plateLabel: 'body' | 'title' = plateEditor.api.getLabel();

basePlateEditor.api.setLevel(1);
basePlateEditor.api.setLevel(2);

void nestedApiLevel;
void nestedLevel;
void plateLabel;
void plateValue;

ParentPlugin.configurePlugin(ChildPlugin, {
  options: {
    // @ts-expect-error invalid configured nested option value
    level: 3,
  },
});

// @ts-expect-error invalid nested editor api argument
basePlateEditor.api.setLevel(3);

DisplayPlugin.configure({
  options: {
    // @ts-expect-error invalid plate plugin option value
    label: 'footer',
  },
});

// @ts-expect-error custom editor api should stay narrow
plateEditor.api.getLabel('extra');

const expectParagraphValue = (value: typeof plateValue) => value;

expectParagraphValue([
  // @ts-expect-error custom editor value type should stay narrow
  { children: [{ text: 'nope' }], type: 'h1' },
]);

type NoConfig = PluginConfig<'noConfig'>;

createBasePlugin<NoConfig>({
  // @ts-expect-error plugins without public configuration reject factory config
  config: { remarkPlugins: [() => {}] },
  key: 'noConfig',
});

createPlatePlugin<NoConfig>({
  // @ts-expect-error plugins without public configuration reject factory config
  config: { remarkPlugins: [() => {}] },
  key: 'noConfig',
});

const NoConfigPlugin = createBasePlugin({ key: 'noConfig' });
const NoConfigPlatePlugin = createPlatePlugin({ key: 'noConfigPlate' });
const ConfiguredPlugin = createBasePlugin({
  config: { label: 'initial' },
  key: 'configured',
});
const ConfiguredPlatePlugin = createPlatePlugin({
  config: { label: 'initial' },
  key: 'configuredPlate',
});

NoConfigPlugin.configure({
  // @ts-expect-error no-config descriptors reject configuration overlays
  config: { remarkPlugins: [() => {}] },
});
NoConfigPlugin.extend({
  // @ts-expect-error no-config descriptors reject configuration extensions
  config: { remarkPlugins: [() => {}] },
});
NoConfigPlatePlugin.configure({
  // @ts-expect-error no-config Plate descriptors reject configuration overlays
  config: { remarkPlugins: [() => {}] },
});
NoConfigPlatePlugin.extend({
  // @ts-expect-error no-config Plate descriptors reject configuration extensions
  config: { remarkPlugins: [() => {}] },
});
ParentPlugin.configurePlugin(NoConfigPlugin, {
  // @ts-expect-error nested no-config descriptors reject configuration overlays
  config: { remarkPlugins: [() => {}] },
});

const noConfigEditor = createBaseEditor({
  plugins: [NoConfigPlugin],
});

// @ts-expect-error editor configuration is unavailable without public config
noConfigEditor.configure(NoConfigPlugin, { remarkPlugins: [() => {}] });

ConfiguredPlugin.configure({
  config: { label: 'configured' },
});
ConfiguredPlugin.extend({
  config: { label: 'extended' },
});
ConfiguredPlatePlugin.configure({
  config: { label: 'configured' },
});
ConfiguredPlatePlugin.extend({
  config: { label: 'extended' },
});
