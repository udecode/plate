import type { PluginConfig } from '@platejs/core';
import {
  createSlateEditor,
  createSlatePlugin,
  createTSlatePlugin,
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
  {},
  {
    isLevel: (level: 1 | 2) => boolean;
  },
  {
    child: {
      setMode: (mode: ChildMode) => void;
    };
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
  .extendTx(({ plugin }) => () => ({
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
  .extendTx(({ plugin }) => () => ({
    setTone: (tone: FormatTone) => {
      plugin.options.tone = tone;
    },
  }));

const InspectorPlugin = createSlatePlugin({
  key: 'inspector',
})
  .extendEditorApi(({ editor }) => ({
    describeFormat: () => editor.getPluginApi(FormatPlugin).format(),
  }))
  .extendTx(({ editor }) => () => ({
    setFriendly: () => {
      editor.update((tx) => tx.format.setTone('friendly'));
    },
  }));

const slateEditor = createSlateEditor({
  plugins: [GrandparentPlugin, FormatPlugin, InspectorPlugin],
});

const childLevel: 1 | 2 = slateEditor.getOptions(ChildPlugin).level;
const childMode: ChildMode = slateEditor.getOptions(ChildPlugin).mode;
const childLabel: ChildLabel = slateEditor.getPluginApi(ChildPlugin).getLabel();
const isLevelTwo: boolean = slateEditor.getOption(ChildPlugin, 'isLevel', 2);
const formatTone: FormatTone = slateEditor.api.format();
const describedFormat: FormatTone = slateEditor.api.describeFormat();

slateEditor.update((tx) => {
  tx.child.setMode('view');
  tx.child.setMode('edit');
  tx.format.setTone('formal');
  tx.format.setTone('friendly');
  tx.inspector.setFriendly();
});

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

slateEditor.update((tx) => {
  // @ts-expect-error invalid nested tx argument
  tx.child.setMode('preview');
});

// @ts-expect-error invalid merged editor api
slateEditor.api.missingFormat();

slateEditor.update((tx) => {
  // @ts-expect-error invalid merged tx argument
  tx.format.setTone('preview');
});
