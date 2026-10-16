import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  editorCommands,
  schema,
  SelectionApi,
} from 'plitejs';
import { dataTransferFormats, dom } from 'plitejs/dom';

import { createAuthoredPlugin } from '../src/authored/authored';

class FakeDataTransfer {
  private readonly store = new Map<string, string>();

  get types() {
    return [...this.store.keys()];
  }

  getData(type: string) {
    return this.store.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.store.set(type, value);
  }
}

const paragraph = (text: string) => ({
  type: 'paragraph' as const,
  children: [{ text }],
});
const card = (root: string) => ({
  type: 'card',
  childRoots: { body: root },
  children: [{ text: 'C' }],
});
const text = () => schema.content.text({ default: 'text', min: 1 });

const ExclusiveCards = defineEditorSchema('refused-update-answer', {
  elements: {
    card: {
      content: text(),
      contentRoots: {
        body: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: { content: text() },
  },
  root: schema.content.types(['paragraph', 'card'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
});

const initialValue = {
  children: [card('b1'), paragraph('aa')],
  roots: { b1: [paragraph('Body')] },
};
const overCard = SelectionApi.text({
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 0, path: [1, 0] },
});
const carried = () =>
  ContentSlice.fromJSON({
    content: [card('b2')],
    openEnd: 0,
    openStart: 0,
    roots: { b2: [paragraph('X')] },
  });
const cardBlock = () => ContentSlice.closed([paragraph('x')]);

const Replacer = definePlugin('replacer', {
  update: ({ tx }) => ({
    replaceCard: () =>
      tx.command(editorCommands.replaceSlice, { slice: cardBlock() }),
  }),
});

const make = (
  intent: 'edit' | 'propose',
  selection:
    | ReturnType<typeof SelectionApi.nodes>
    | ReturnType<typeof SelectionApi.text> = SelectionApi.nodes([[0]], {
    mode: 'block',
  })
) => {
  const editor = createEditor({
    initialSelection: selection,
    initialValue: initialValue as never,
    plugins: [
      ExclusiveCards,
      dom(),
      Replacer,
      dataTransferFormats('refused-update-answer-formats', [
        {
          decode: carried,
          key: 'carried',
          mimeType: 'application/x-carried',
        },
      ]),
      createAuthoredPlugin({
        authorId: 'bob',
        createChangeId: () => 'bob:1',
        intent,
        now: () => 1,
      }),
    ] as const,
  });
  const refusals: string[] = [];

  editor.api.authored.subscribeRefusals((refusal) => {
    refusals.push(refusal.code);
  });

  return { editor, refusals };
};

describe('an update call answers what landed', () => {
  it("answers the callback's own value", () => {
    const { editor } = make('edit');
    const before = editor.read.value();

    assert.equal(
      editor.update(() => 7),
      7
    );
    assert.deepEqual(editor.read.value(), before);
  });

  it('answers what the transaction answered when the update lands', () => {
    const { editor } = make('edit');

    assert.equal(
      editor.update((tx) =>
        tx.command(editorCommands.replaceSlice, { slice: cardBlock() })
      ),
      true
    );
    assert.deepEqual(editor.read.children(), [paragraph('x'), paragraph('aa')]);
  });

  it('answers undefined when Suggesting refuses the update', () => {
    const { editor, refusals } = make('propose');
    const before = editor.read.value();

    assert.equal(
      editor.update((tx) =>
        tx.command(editorCommands.replaceSlice, { slice: cardBlock() })
      ),
      undefined
    );
    assert.deepEqual(editor.read.value(), before);
    assert.deepEqual(refusals, ['unrepresentable']);
  });

  it("keeps its answer when a commit listener's update is refused", () => {
    const { editor, refusals } = make('edit');
    const view = createEditorView(editor, {
      authored: { intent: 'propose' },
    });
    let listened: unknown = 'not run';
    const unsubscribe = editor.subscribeCommit(() => {
      unsubscribe();
      listened = view.update((tx) => {
        tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }));

        return tx.command(editorCommands.replaceSlice, { slice: cardBlock() });
      });
    });

    assert.equal(
      editor.update((tx) => {
        tx.text.insert('!', { at: { offset: 2, path: [1, 0] } });

        return 'landed';
      }),
      'landed'
    );
    assert.equal(listened, undefined);
    assert.deepEqual(refusals, ['unrepresentable']);
    assert.deepEqual(editor.read.children(), [card('b1'), paragraph('aa!')]);
  });
});

describe('a call that opens its own update answers undefined when refused', () => {
  const refused = {
    'editor.update.slice.replace': (
      editor: ReturnType<typeof make>['editor']
    ) => editor.update.slice.replace(cardBlock()),
    'editor.update.fragment.replace': (
      editor: ReturnType<typeof make>['editor']
    ) => editor.update.fragment.replace([paragraph('x')]),
    'editor.update.command': (editor: ReturnType<typeof make>['editor']) =>
      editor.update.command(editorCommands.replaceSlice, {
        slice: cardBlock(),
      }),
    'editor.update.<plugin>': (editor: ReturnType<typeof make>['editor']) =>
      editor.update.replacer.replaceCard(),
    'editor.plugin(P).update': (editor: ReturnType<typeof make>['editor']) =>
      editor.plugin(Replacer).update.replaceCard(),
  };

  for (const [name, call] of Object.entries(refused)) {
    it(name, () => {
      const { editor, refusals } = make('propose');
      const before = editor.read.value();

      assert.equal(call(editor), undefined);
      assert.deepEqual(editor.read.value(), before);
      assert.deepEqual(refusals, ['unrepresentable']);
    });
  }
});

describe('a refused paste', () => {
  it('answers undefined and does not fall back to plain text', () => {
    const { editor, refusals } = make('propose', overCard);
    const before = editor.read.value();
    const data = new FakeDataTransfer();

    data.setData('application/x-carried', 'carried');
    data.setData('text/plain', 'plain');

    assert.equal(
      editor.api.dom.clipboard.insertData(data as unknown as DataTransfer),
      undefined
    );
    assert.deepEqual(editor.read.value(), before);
    assert.deepEqual(refusals, ['unrepresentable']);
  });

  it('answers true for plain text Suggesting can record', () => {
    const { editor, refusals } = make(
      'propose',
      SelectionApi.text({
        anchor: { offset: 1, path: [1, 0] },
        focus: { offset: 1, path: [1, 0] },
      })
    );
    const data = new FakeDataTransfer();

    data.setData('text/plain', 'x');

    assert.equal(
      editor.api.dom.clipboard.insertTextData(data as unknown as DataTransfer),
      true
    );
    assert.equal(editor.read.text.string([1]), 'axa');
    assert.deepEqual(refusals, []);
  });

  it('keeps tx.dom.insertData answering for its draft', () => {
    const { editor } = make(
      'edit',
      SelectionApi.text({
        anchor: { offset: 1, path: [1, 0] },
        focus: { offset: 1, path: [1, 0] },
      })
    );
    const data = new FakeDataTransfer();

    data.setData('text/plain', 'x');

    editor.update((tx) => {
      const handled = tx.dom.insertData(data as unknown as DataTransfer);

      assert.equal(handled, true);
    });
    assert.equal(editor.read.text.string([1]), 'axa');
  });

  it('answers undefined for plain text Suggesting refuses', () => {
    const { editor, refusals } = make('propose');
    const before = editor.read.value();
    const data = new FakeDataTransfer();

    data.setData('text/plain', 'x');

    assert.equal(
      editor.api.dom.clipboard.insertTextData(data as unknown as DataTransfer),
      undefined
    );
    assert.deepEqual(editor.read.value(), before);
    assert.deepEqual(refusals, ['unrepresentable']);
  });
});
