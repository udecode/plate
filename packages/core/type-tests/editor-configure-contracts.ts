import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';

const childInitialState: { level: 1 | 2 } = {
  level: 1,
};

const ChildPlugin = createBasePlugin({
  extension: ({ plugin, store }) => ({
    api: {
      plugin: {
        getLevel: () => plugin.initialState.level,
      },
      setLevel: (level: 1 | 2) => {
        store.set({ level });
      },
    },
  }),
  key: 'child',
  initialState: childInitialState,
});

const ParentPlugin = createBasePlugin({
  dependencies: [ChildPlugin],
  key: 'parent',
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
  extension: ({ store }) => ({
    api: {
      getLabel: () => store.get().label,
    },
  }),
  key: 'display',
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

ChildPlugin.configure({
  initialState: {
    // @ts-expect-error invalid configured nested state value
    level: 3,
  },
});

// @ts-expect-error invalid nested editor api argument
basePlateEditor.api.setLevel(3);

DisplayPlugin.configure({
  initialState: {
    // @ts-expect-error invalid Plate plugin state value
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
