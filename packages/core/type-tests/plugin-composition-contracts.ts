import type { PluginConfig } from '@platejs/core';
import { createBasePlateEditor, createEditorPlugin } from '@platejs/core';

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

const ChildPlugin = createEditorPlugin<ChildConfig>({
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

const ParentPlugin = createEditorPlugin({
  key: 'parent',
  plugins: [ChildPlugin],
}).configurePlugin(ChildPlugin, {
  options: {
    level: 2,
  },
});

const GrandparentPlugin = createEditorPlugin({
  key: 'grandparent',
  plugins: [ParentPlugin],
}).configurePlugin(ChildPlugin, {
  options: {
    mode: 'edit',
  },
});

type FormatTone = 'formal' | 'friendly';

const FormatPlugin = createEditorPlugin({
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

const InspectorPlugin = createEditorPlugin({
  key: 'inspector',
})
  .extendEditorApi(({ editor }) => ({
    describeFormat: () => editor.api.format(),
  }))
  .extendTx(({ editor }) => () => ({
    setFriendly: () => {
      editor.update((tx) => tx.format.setTone('friendly'));
    },
  }));

const basePlateEditor = createBasePlateEditor({
  plugins: [GrandparentPlugin, FormatPlugin, InspectorPlugin],
});

const childLevel: 1 | 2 = basePlateEditor.getOptions(ChildPlugin).level;
const childMode: ChildMode = basePlateEditor.getOptions(ChildPlugin).mode;
const childLabel: ChildLabel = basePlateEditor.api.getLabel();
const isLevelTwo: boolean = basePlateEditor.getOption(
  ChildPlugin,
  'isLevel',
  2
);
const formatTone: FormatTone = basePlateEditor.api.format();
const describedFormat: FormatTone = basePlateEditor.api.describeFormat();

basePlateEditor.update((tx) => {
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
basePlateEditor.getOption(ChildPlugin, 'isLevel', 3);

basePlateEditor.update((tx) => {
  // @ts-expect-error invalid nested tx argument
  tx.child.setMode('preview');
});

// @ts-expect-error invalid merged editor api
basePlateEditor.api.missingFormat();

basePlateEditor.update((tx) => {
  // @ts-expect-error invalid merged tx argument
  tx.format.setTone('preview');
});
