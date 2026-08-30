import {
  createEditor as createHeadlessEditor,
  defineBasePlugin,
} from 'platejs';
import { createEditor, definePlatePlugin } from 'platejs/react';

import type { ValueOf } from '../src/core';

const childInitialState: { level: 1 | 2 } = {
  level: 1,
};

const ChildPlugin = defineBasePlugin('child', {
  api: ({ plugin, store }) => ({
    getLevel: () => plugin.initialState.level,
    setLevel: (level: 1 | 2) => {
      store.set({ level });
    },
  }),
  initialState: childInitialState,
});

const ParentPlugin = defineBasePlugin('parent', {
  dependencies: [ChildPlugin],
});
const ConfiguredChildPlugin = ChildPlugin.configure({
  initialState: {
    level: 2,
  },
});

const basePlateEditor = createHeadlessEditor({
  plugins: [ParentPlugin, ConfiguredChildPlugin],
});

const displayInitialState: { label: 'body' | 'title' } = {
  label: 'title',
};

const DisplayPlugin = definePlatePlugin('display', {
  api: ({ store }) => ({
    getLabel: () => store.get().label,
  }),
  initialState: displayInitialState,
});

const plateEditor = createEditor({
  plugins: [DisplayPlugin],
  initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }] as [
    { children: [{ text: string }]; type: 'paragraph' },
  ],
});

const nestedLevel: 1 | 2 = basePlateEditor
  .plugin(ChildPlugin)
  .store.get().level;
const nestedApiLevel: 1 | 2 = basePlateEditor.api.child.getLevel();
const plateValue: ValueOf<typeof plateEditor> = [
  { children: [{ text: 'hello' }], type: 'paragraph' },
];
const paragraphType: string = plateValue[0].type;
const plateLabel: 'body' | 'title' = plateEditor.api.display.getLabel();

basePlateEditor.api.child.setLevel(1);
basePlateEditor.api.child.setLevel(2);

void nestedApiLevel;
void nestedLevel;
void plateLabel;
void paragraphType;
void plateValue;

ChildPlugin.configure({
  initialState: {
    // @ts-expect-error invalid configured nested state value
    level: 3,
  },
});

// @ts-expect-error invalid nested editor api argument
basePlateEditor.api.child.setLevel(3);

DisplayPlugin.configure({
  initialState: {
    // @ts-expect-error invalid Plate plugin state value
    label: 'footer',
  },
});

// @ts-expect-error custom editor api should stay narrow
plateEditor.api.display.getLabel('extra');

const rawValueIsIntentionallyBroad: typeof plateValue = [
  { children: [{ text: 'nope' }], type: 'applicationNode' },
];

void rawValueIsIntentionallyBroad;
