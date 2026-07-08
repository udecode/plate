import type { PluginConfig } from '@platejs/core';
import { createBaseEditor, createBasePlugin } from '@platejs/core';

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
    getMode: () => ChildMode;
  },
  {
    child: {
      setMode: (mode: ChildMode) => void;
    };
  },
  {
    isLevel: (level: 1 | 2) => boolean;
    isMode: (mode: ChildMode) => boolean;
  }
>;

const ChildPlugin = createBasePlugin<ChildConfig>({
  key: 'child',
  options: {
    level: 1,
    mode: 'view',
  },
})
  .extendSelectors(({ getOptions }) => ({
    isLevel: (level: 1 | 2) => getOptions().level === level,
    isMode: (mode: ChildMode) => getOptions().mode === mode,
  }))
  .extendEditorApi(({ getOptions }) => ({
    getLabel: () => `${getOptions().mode}:${getOptions().level}` as ChildLabel,
    getMode: () => getOptions().mode,
  }))
  .extendTx(({ plugin }) => () => ({
    setMode: (mode) => {
      plugin.options.mode = mode;
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

const GrandparentPlugin = createBasePlugin({
  key: 'grandparent',
  plugins: [ParentPlugin],
}).configurePlugin(ChildPlugin, {
  options: {
    mode: 'edit',
  },
});

const PartialChildOverridePlugin = createBasePlugin({
  key: 'partialChildOverride',
  plugins: [ChildPlugin],
}).configurePlugin(ChildPlugin, {
  api: {
    getLabel: () => 'edit:2' as const,
  },
  selectors: {
    isLevel: (level) => level === 2,
  },
});

type FormatTone = 'formal' | 'friendly';

const FormatPlugin = createBasePlugin({
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

const InspectorPlugin = createBasePlugin({
  key: 'inspector',
})
  .extendEditorApi(() => ({
    inspect: () => 'inspector' as const,
  }))
  .extendTx(() => () => ({
    setFriendly: () => undefined,
  }));

const basePlateEditor = createBaseEditor({
  plugins: [
    GrandparentPlugin,
    PartialChildOverridePlugin,
    FormatPlugin,
    InspectorPlugin,
  ],
});

const childLevel: 1 | 2 = basePlateEditor
  .plugin(ChildPlugin)
  .getOptions().level;
const childMode: ChildMode = basePlateEditor
  .plugin(ChildPlugin)
  .getOptions().mode;
const childLabel: ChildLabel = basePlateEditor.api.getLabel();
const childModeFromPartialApi: ChildMode = basePlateEditor.api.getMode();
const isLevelTwo: boolean = basePlateEditor
  .plugin(ChildPlugin)
  .getOption('isLevel', 2);
const formatTone: FormatTone = basePlateEditor.api.format();
const inspected: 'inspector' = basePlateEditor.api.inspect();

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
void childModeFromPartialApi;
void formatTone;
void inspected;
void isLevelTwo;

GrandparentPlugin.configurePlugin(ChildPlugin, {
  options: {
    // @ts-expect-error invalid nested configured option value
    mode: 'preview',
  },
});

GrandparentPlugin.configurePlugin(
  ChildPlugin,
  ({ editor, getOptions, plugin }) => {
    const childLevel: 1 | 2 = getOptions().level;
    const childMode: ChildMode = plugin.options.mode;

    editor.update((tx) => {
      tx.child.setMode('edit');
      // @ts-expect-error invalid nested tx argument from configurePlugin context
      tx.child.setMode('preview');
    });

    void childLevel;
    void childMode;

    return {
      options: {
        level: 2 as const,
      },
    };
  }
);

GrandparentPlugin.configurePlugin(ChildPlugin, ({ getOptions }) => {
  // @ts-expect-error invalid option key from configurePlugin context
  const missing = getOptions().missing;
  void missing;

  return {
    options: {
      mode: 'edit' as const,
    },
  };
});

// @ts-expect-error invalid nested configured option value from callback
GrandparentPlugin.configurePlugin(ChildPlugin, () => ({
  options: {
    mode: 'preview',
  },
}));

// @ts-expect-error invalid merged selector argument
basePlateEditor.plugin(ChildPlugin).getOption('isLevel', 3);

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
