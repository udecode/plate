import {
  createEditor,
  defineEditorExtension,
  type DocumentChange,
  type Editor,
  type ValueOf,
} from '@platejs/plite';

import type { EditorImmutableConfig } from '../src/interfaces/editor';

type CustomText = {
  readonly bold?: true;
  readonly text: string;
};

type ParagraphElement = {
  readonly children: readonly CustomText[];
  readonly type: 'paragraph';
};

type CustomValue = readonly ParagraphElement[];

type CustomEditor = Editor<CustomValue>;

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: 'paragraph' }] },
];

const immutableConfigExtension = defineEditorExtension({
  config: {
    count: 1,
    enabled: true,
    label: 'paragraph',
    nullable: null,
    optional: undefined,
    tuple: ['paragraph', 2],
  },
  name: 'immutable-config',
});
const exactConfigCount: 1 = immutableConfigExtension.config.count;
const exactConfigEnabled: true = immutableConfigExtension.config.enabled;
const exactConfigLabel: 'paragraph' = immutableConfigExtension.config.label;
const exactConfigTuple: readonly ['paragraph', 2] =
  immutableConfigExtension.config.tuple;

declare const immutableConfigSymbol: symbol;

// @ts-expect-error bigint is not a valid immutable extension config value.
const invalidBigintConfig: EditorImmutableConfig<bigint> = 1n;
// @ts-expect-error symbols are not valid immutable extension config values.
const invalidSymbolConfig: EditorImmutableConfig<symbol> =
  immutableConfigSymbol;

const extension = defineEditorExtension<CustomEditor>()({
  name: 'generic-extension',
  onTransactionChange(context) {
    const change: DocumentChange = context.change;
    const changedPaths = context.changed.paths();
    const changedRanges = context.changed.topLevelRanges();
    const textChanged = context.changed.has('text');
    const value: Readonly<ValueOf<typeof context.editor>> = context.editor.read(
      (state) => state.children()
    );

    void change;
    void changedPaths;
    void changedRanges;
    void textChanged;
    void value;
  },
  onCommit({ commit, snapshot }) {
    const change: DocumentChange = commit.changes;
    const changedPaths = commit.changed.paths();
    const children: CustomValue = snapshot.children;

    void change;
    void changedPaths;
    void children;
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-commit-listeners',
  // @ts-expect-error extension authors use onCommit
  commitListeners: [() => {}],
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-register',
  // @ts-expect-error extension authors use declarative slots or activate
  register() {},
});

const editor = createEditor<CustomValue, readonly [typeof extension]>({
  extensions: [extension] as const,
  initialValue,
});
const value: Readonly<CustomValue> = editor.read((state) => state.children());

void value;
void exactConfigCount;
void exactConfigEnabled;
void exactConfigLabel;
void exactConfigTuple;
void invalidBigintConfig;
void invalidSymbolConfig;
