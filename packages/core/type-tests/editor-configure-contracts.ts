import { createEditor } from '@platejs/slate';

import type { PluginConfig } from '@platejs/core';
import {
  createSlatePlugin,
  createTSlatePlugin,
  withSlate,
} from '@platejs/core';
import { createPlateEditor, createTPlatePlugin } from '@platejs/core/react';

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

const ChildPlugin = createTSlatePlugin<ChildConfig>({
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

const ParentPlugin = createSlatePlugin({
  key: 'parent',
  plugins: [ChildPlugin],
}).configurePlugin(ChildPlugin, {
  options: {
    level: 2,
  },
});

const slateEditor = withSlate(createEditor(), {
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

const DisplayPlugin = createTPlatePlugin<DisplayConfig>({
  key: 'display',
  options: {
    label: 'title',
  },
}).extendEditorApi(({ getOptions }) => ({
  getLabel: () => getOptions().label,
}));

const plateEditor = createPlateEditor<
  [{ children: [{ text: string }]; type: 'p' }],
  typeof DisplayPlugin
>({
  plugins: [DisplayPlugin],
  value: [{ children: [{ text: 'hello' }], type: 'p' }],
});

const nestedLevel: 1 | 2 = slateEditor.getOptions(ChildPlugin).level;
const nestedApiLevel: 1 | 2 = slateEditor.getApi(ChildPlugin).plugin.getLevel();
const plateValue: [{ children: [{ text: string }]; type: 'p' }] =
  plateEditor.children;
const plateLabel: 'body' | 'title' = plateEditor.api.getLabel();

slateEditor.getApi(ChildPlugin).setLevel(1);
slateEditor.getApi(ChildPlugin).setLevel(2);

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
slateEditor.getApi(ChildPlugin).setLevel(3);

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
