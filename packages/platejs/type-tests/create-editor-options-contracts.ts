import {
  type Editor as HeadlessEditor,
  type Element,
  type Value,
  BaseParagraphPlugin,
  createEditor,
} from 'platejs';
import {
  type Editor as PlateEditor,
  createEditor as createReactEditor,
  useCreateEditor,
} from 'platejs/react';

import type { Editor as PliteEditor } from '../src/facade';
import type { PliteReactEditor } from '../src/react/internal/plite-types';

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;

const initialValue = [{ children: [{ text: 'One' }], type: 'paragraph' }];

createEditor({
  plugins: [BaseParagraphPlugin],
  // @ts-expect-error -- the error names the document key, not the plugins
  value: initialValue,
});

createReactEditor({
  plugins: [BaseParagraphPlugin],
  // @ts-expect-error -- the error names the document key, not the plugins
  value: initialValue,
});

export const useMisspelledEditor = () =>
  useCreateEditor({
    plugins: [BaseParagraphPlugin],
    // @ts-expect-error -- the error names the document key, not the plugins
    value: initialValue,
  });

const typedSeed: Element[] = [{ children: [{ text: 'a' }], type: 'paragraph' }];

const seededReactEditor = createReactEditor({
  plugins: [BaseParagraphPlugin],
  initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
});
const seededPluginlessEditor = createReactEditor({
  initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
});
const seededHeadlessEditor = createEditor({
  plugins: [BaseParagraphPlugin],
  initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
});
const typedSeedEditor = createReactEditor({
  plugins: [BaseParagraphPlugin],
  initialValue: typedSeed,
});
const typedSeedHeadlessEditor = createEditor({
  plugins: [BaseParagraphPlugin],
  initialValue: typedSeed,
});
const callbackSeedEditor = createReactEditor({
  plugins: [BaseParagraphPlugin],
  initialValue: () => typedSeed,
});
const documentSeedEditor = createEditor({
  plugins: [BaseParagraphPlugin],
  initialValue: { children: typedSeed },
});

type ReadDocument<TEditor extends { read: { children: () => unknown } }> =
  ReturnType<TEditor['read']['children']>;

const seedsKeepValue: [
  Equal<ReadDocument<typeof seededReactEditor>, Value>,
  Equal<ReadDocument<typeof seededPluginlessEditor>, Value>,
  Equal<ReadDocument<typeof seededHeadlessEditor>, Value>,
  Equal<ReadDocument<typeof typedSeedEditor>, Value>,
  Equal<ReadDocument<typeof typedSeedHeadlessEditor>, Value>,
  Equal<ReadDocument<typeof callbackSeedEditor>, Value>,
  Equal<ReadDocument<typeof documentSeedEditor>, Value>,
] = [true, true, true, true, true, true, true];

const plainEditorsReadValue: [
  Equal<ReadDocument<PlateEditor>, Value>,
  Equal<ReadDocument<HeadlessEditor>, Value>,
] = [true, true];

const takesReturnedEditor = (editor: ReturnType<typeof createReactEditor>) =>
  editor;
const takesPlateEditor = (editor: PlateEditor) => editor;
const takesHeadlessEditor = (editor: HeadlessEditor) => editor;
const takesPliteEditor = (editor: PliteEditor) => editor;
const takesPliteReactEditor = (editor: PliteReactEditor) => editor;

takesReturnedEditor(seededPluginlessEditor);
takesReturnedEditor(seededReactEditor);
takesPlateEditor(seededReactEditor);
takesPlateEditor(typedSeedEditor);
takesPlateEditor(callbackSeedEditor);
takesHeadlessEditor(seededHeadlessEditor);
takesHeadlessEditor(documentSeedEditor);
takesPliteEditor(seededReactEditor);
takesPliteEditor(seededHeadlessEditor);
takesPliteReactEditor(seededReactEditor);

export const useSeededEditors = (enabled: boolean) => {
  const editor = useCreateEditor({
    plugins: [BaseParagraphPlugin],
    initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
  });
  const optionalEditor = useCreateEditor({
    enabled,
    plugins: [BaseParagraphPlugin],
    initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
  });

  return { editor, optionalEditor };
};

type SeededHookEditors = ReturnType<typeof useSeededEditors>;

const hookEditorTypes: [
  Equal<SeededHookEditors['editor'], typeof seededReactEditor>,
  Equal<SeededHookEditors['optionalEditor'], typeof seededReactEditor | null>,
] = [true, true];

createReactEditor({
  plugins: [BaseParagraphPlugin],
  // @ts-expect-error -- the starting document is checked against Value
  initialValue: [{ text: 'a' }],
});

void seedsKeepValue;
void plainEditorsReadValue;
void hookEditorTypes;
