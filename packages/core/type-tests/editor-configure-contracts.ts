import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';

const childInitialState: { level: 1 | 2 } = {
  level: 1,
};

const ChildPlugin = createBasePlugin({
  api: ({ plugin, store }) => ({
    getLevel: () => plugin.initialState.level,
    setLevel: (level: 1 | 2) => {
      store.set({ level });
    },
  }),
  name: 'child',
  initialState: childInitialState,
});

const ParentPlugin = createBasePlugin({
  dependencies: [ChildPlugin],
  name: 'parent',
});
const ConfiguredChildPlugin = ChildPlugin.configure({
  initialState: {
    level: 2,
  },
});

const basePlateEditor = createBaseEditor({
  plugins: [ParentPlugin, ConfiguredChildPlugin],
});

const displayInitialState: { label: 'body' | 'title' } = {
  label: 'title',
};

const DisplayPlugin = createPlatePlugin({
  api: ({ store }) => ({
    getLabel: () => store.get().label,
  }),
  name: 'display',
  initialState: displayInitialState,
});

const plateEditor = createPlateEditor({
  plugins: [DisplayPlugin],
  initialValue: [{ children: [{ text: 'hello' }], type: 'p' }] as [
    { children: [{ text: string }]; type: 'p' },
  ],
});

const nestedLevel: 1 | 2 = basePlateEditor
  .plugin(ChildPlugin)
  .store.get().level;
const nestedApiLevel: 1 | 2 = basePlateEditor.api.child.getLevel();
const plateValue: readonly [{ children: [{ text: string }]; type: 'p' }] =
  plateEditor.read.children();
const plateLabel: 'body' | 'title' = plateEditor.api.display.getLabel();

basePlateEditor.api.child.setLevel(1);
basePlateEditor.api.child.setLevel(2);

void nestedApiLevel;
void nestedLevel;
void plateLabel;
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

const expectParagraphValue = (value: typeof plateValue) => value;

expectParagraphValue([
  // @ts-expect-error custom editor value type should stay narrow
  { children: [{ text: 'nope' }], type: 'h1' },
]);
