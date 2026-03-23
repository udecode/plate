import { createEditor } from '@platejs/slate';

import type { PluginConfig } from '@platejs/core';
import {
  createSlatePlugin,
  createTSlatePlugin,
  withSlate,
} from '@platejs/core';

type ChildMode = 'edit' | 'view';
type ChildLabel = `${ChildMode}:${1 | 2}`;

type ChildConfig = PluginConfig<
  'child',
  {
    level: 1 | 2;
    mode: ChildMode;
  },
  {
    getLabel: () => ChildLabel;
  },
  {
    setMode: (mode: ChildMode) => void;
  },
  {
    isLevel: (level: 1 | 2) => boolean;
  }
>;

const ChildPlugin = createTSlatePlugin<ChildConfig>({
  key: 'child',
  options: {
    level: 1,
    mode: 'view',
  },
})
  .extendSelectors(({ getOptions }) => ({
    isLevel: (level: 1 | 2) => getOptions().level === level,
  }))
  .extendEditorApi(({ getOptions }) => ({
    getLabel: () => `${getOptions().mode}:${getOptions().level}` as ChildLabel,
  }))
  .extendEditorTransforms(({ plugin }) => ({
    setMode: (mode) => {
      plugin.options.mode = mode;
    },
  }));

const ParentPlugin = createSlatePlugin({
  key: 'parent',
  plugins: [ChildPlugin],
}).configurePlugin(ChildPlugin, {
  options: {
    level: 2,
  },
});

const GrandparentPlugin = createSlatePlugin({
  key: 'grandparent',
  plugins: [ParentPlugin],
}).configurePlugin(ChildPlugin, {
  options: {
    mode: 'edit',
  },
});

type FormatTone = 'formal' | 'friendly';

const FormatPlugin = createSlatePlugin({
  key: 'format',
  options: {
    tone: 'formal' as FormatTone,
  },
})
  .extendEditorApi(({ getOptions }) => ({
    format: () => getOptions().tone,
  }))
  .extendEditorTransforms(({ plugin }) => ({
    setTone: (tone: FormatTone) => {
      plugin.options.tone = tone;
    },
  }));

const InspectorPlugin = createSlatePlugin({
  key: 'inspector',
})
  .extendEditorApi(({ editor }) => ({
    describeFormat: () => editor.getApi(FormatPlugin).format(),
  }))
  .extendEditorTransforms(({ editor }) => ({
    setFriendly: () => {
      editor.getPlugin(FormatPlugin).transforms.setTone('friendly');
    },
  }));

const slateEditor = withSlate(createEditor(), {
  plugins: [GrandparentPlugin, FormatPlugin, InspectorPlugin],
});

const childLevel: 1 | 2 = slateEditor.getOptions(ChildPlugin).level;
const childMode: ChildMode = slateEditor.getOptions(ChildPlugin).mode;
const childLabel: ChildLabel = slateEditor.getApi(ChildPlugin).getLabel();
const isLevelTwo: boolean = slateEditor.getOption(ChildPlugin, 'isLevel', 2);
const formatTone: FormatTone = slateEditor.api.format();
const describedFormat: FormatTone = slateEditor.api.describeFormat();

slateEditor.getPlugin(ChildPlugin).transforms.setMode('view');
slateEditor.getPlugin(ChildPlugin).transforms.setMode('edit');
slateEditor.transforms.setTone('formal');
slateEditor.transforms.setTone('friendly');
slateEditor.transforms.setFriendly();

void childLabel;
void childLevel;
void childMode;
void describedFormat;
void formatTone;
void isLevelTwo;

GrandparentPlugin.configurePlugin(ChildPlugin, {
  options: {
    // @ts-expect-error invalid nested configured option value
    mode: 'preview',
  },
});

// @ts-expect-error invalid merged selector argument
slateEditor.getOption(ChildPlugin, 'isLevel', 3);

// @ts-expect-error invalid nested transform argument
slateEditor.getPlugin(ChildPlugin).transforms.setMode('preview');

// @ts-expect-error invalid merged editor api
slateEditor.api.missingFormat();

// @ts-expect-error invalid merged transform argument
slateEditor.transforms.setTone('preview');
