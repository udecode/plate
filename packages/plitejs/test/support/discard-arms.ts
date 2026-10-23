import { applyTransactionSpec } from '../../src/core/public-state';
import {
  createEditor,
  createEditorView,
  type Descendant,
  NodeApi,
} from '../../src/index';

type KeyReader = {
  key: (target: never) => string | null;
  read: { children: () => readonly Descendant[] };
};

const P = (text: string) => ({ type: 'paragraph', children: [{ text }] });

const tryKey = (reader: KeyReader, target: unknown) => {
  try {
    return reader.key(target as never);
  } catch (error) {
    return `throws ${String(error)}`;
  }
};

const keysOf = (readers: Record<string, KeyReader>) =>
  Object.entries(readers).map(([root, reader]) => [
    root,
    [...NodeApi.descendants({ children: reader.read.children() } as any)].map(
      ([node, path]) => [tryKey(reader, path), tryKey(reader, node)]
    ),
  ]);

const arm = process.argv[2];

if (arm !== 'spec' && arm !== 'control') {
  throw new Error(`Unknown discard arm ${arm}`);
}

const editor = createEditor({
  initialValue: {
    children: [P('One'), P('Two')],
    roots: { header: [P('Head')] },
  },
});
const header = createEditorView(editor, { root: 'header' });
let draft: unknown;
const outer = editor.read((state) =>
  state.transaction((tx) => {
    tx.selection.set({
      kind: 'text',
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [1, 0], offset: 3 },
    });
    tx.fragment.replace([P('a'), P('b'), P('c')]);
    const block = tx.children()[2];

    if (arm === 'spec') {
      editor.read((ambient) =>
        ambient.transaction((inner) => inner.nodes.insert(block, { at: [0] }))
      );
    } else {
      tx.key([2]);
    }
    draft = keysOf({
      main: {
        key: (target) => tx.key(target),
        read: { children: () => tx.children() },
      },
    });
  })
);

editor.update(() => applyTransactionSpec(editor, outer));

process.stdout.write(
  JSON.stringify({ draft, live: keysOf({ header, main: editor }) })
);
