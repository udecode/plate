import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineCommand,
  defineEditorSchema,
  ContentSlice,
  DocumentChange,
  editorCommands,
  type EditorUpdateTransaction,
  type PluginReference,
  property,
  schema,
  transfer,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { readLedgerWork } from '../src/authored/ledger/work';
import { probeCommandNativeEquivalent } from '../src/core/command-registry';
import { withEditorTargetRuntime } from '../src/core/target-runtime';
import { applyEditableCommand } from '../src/react/editable/mutation-controller';
import {
  authoredTestApi,
  expandedChildren,
  reviewedValue,
} from './support/authored';

// Commands decide on the document with every pending change accepted, so for
// each case accepting everything must give what a plain editor gives on the
// accepted start, and rejecting must give back what was there.

type Intent = 'edit' | 'propose';
type Node = Record<string, unknown>;
type At = [number[], number] | [[number[], number], [number[], number]];

const blocks = {
  elements: {
    divider: { void: 'block' },
    heading: { content: schema.content.text() },
    link: { content: schema.content.text(), inline: true },
    mention: { void: 'inline' },
    paragraph: schema.element.textBlock(),
    quote: {
      content: schema.content.types(['heading', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.types(['divider', 'heading', 'paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
} as const;
const Blocks = defineEditorSchema('command-blocks', {
  ...blocks,
  id: 'command-blocks',
});
const ChipBlocks = defineEditorSchema('command-chip-blocks', {
  ...blocks,
  elements: {
    ...blocks.elements,
    chip: {
      content: schema.content.text(),
      contentRoots: {
        note: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      inline: true,
    },
  },
  id: 'command-chip-blocks',
});
const HeaderBlocks = defineEditorSchema('command-header-blocks', {
  ...blocks,
  id: 'command-header-blocks',
  roots: { header: blocks.root },
});

const mark = (kind: string) => ({
  at: 1,
  author: 'carol',
  change: 'carol:1',
  kind,
});
const text = (value: string | Node): Node =>
  typeof value === 'string' ? { text: value } : value;
const p = (...children: Array<string | Node>): Node => ({
  children: children.map(text),
  type: 'paragraph',
});
const h = (...children: Array<string | Node>): Node => ({
  children: children.map(text),
  type: 'heading',
});
const link = (value: string): Node => ({
  children: [{ text: value }],
  type: 'link',
});
const q = (...children: Node[]): Node => ({ children, type: 'quote' });
const struck = (value: string): Node => ({
  authored: [mark('delete')],
  text: value,
});
const struckBlock = (block: Node): Node => ({
  ...block,
  authored: [mark('delete')],
  children: (block.children as Node[]).map((child) => ({
    ...child,
    authored: [mark('delete')],
  })),
});
const joined = (block: Node, author = 'carol'): Node => ({
  ...block,
  authored: [{ ...mark('join'), author, change: `${author}:1` }],
});
const follower = (
  block: Node,
  author = 'erin',
  change = `~edit:${author}`,
  join = 'carol:1'
): Node => ({
  ...block,
  authored: [
    {
      at: 1,
      author,
      change,
      follows: JSON.stringify([join, 1]),
      kind: 'insert',
    },
  ],
});
const held = (value: string): Node => ({
  authored: [mark('held')],
  text: value,
});
const annStruck = (value: string): Node => ({
  authored: [{ ...mark('delete'), author: 'ann', change: 'ann:1' }],
  text: value,
});

const make = (
  value: Node[] | Readonly<{ children: Node[]; roots: Record<string, Node[]> }>,
  intent: Intent | 'plain',
  plugins: readonly PluginReference[] = [],
  blockSchema: PluginReference = Blocks
) => {
  let count = 0;
  let clock = 1;

  return createEditor({
    initialValue: value as never,
    plugins: [
      blockSchema,
      ...plugins,
      ...(intent === 'plain'
        ? []
        : [
            createAuthoredPlugin({
              authorId: 'bob',
              createChangeId: () => `bob:${(count += 1)}`,
              intent,
              now: () => (clock += 1),
            }),
          ]),
    ],
  });
};
type Editor = ReturnType<typeof make>;

const changesOf = (value: readonly unknown[], author?: string) => {
  const changes = new Set<string>();
  const visit = (node: Node) => {
    for (const { change } of (node.authored ?? []) as Array<{
      change: string;
    }>) {
      changes.add(change);
    }
    (node.children as Node[] | undefined)?.forEach(visit);
  };

  (value as Node[]).forEach(visit);

  return [...changes].filter((c) => !author || c.startsWith(`${author}:`));
};
const decided = (
  value: readonly unknown[],
  action: 'accept' | 'reject',
  author?: string,
  blockSchema: PluginReference = Blocks
) => {
  const editor = make(value as Node[], 'edit', [], blockSchema);
  const changes = changesOf(value, author);

  if (changes.length > 0) {
    authoredTestApi(editor).decide({ action, changes });
  }

  return reviewedValue(editor).children;
};
const unmarked = (value: readonly unknown[]): unknown =>
  JSON.parse(
    JSON.stringify(value, (key, field) =>
      key === 'authored' ? undefined : field
    )
  );
const selectionOf = (at: At) => {
  const [anchor, focus] =
    typeof at[1] === 'number' ? [at, at] : (at as [At, At]);

  return {
    anchor: { offset: anchor[1] as number, path: anchor[0] as number[] },
    focus: { offset: focus[1] as number, path: focus[0] as number[] },
  };
};
const textOf = (node: Node): string =>
  typeof node.text === 'string'
    ? node.text
    : ((node.children as Node[] | undefined) ?? []).map(textOf).join('');
const carolStruck = (value: readonly unknown[]) => {
  const out: string[] = [];
  const visit = (node: Node) => {
    if (typeof node.text !== 'string') {
      (node.children as Node[] | undefined)?.forEach(visit);
    } else if (
      ((node.authored ?? []) as Array<{ change: string; kind: string }>).some(
        (m) => m.kind === 'delete' && m.change === 'carol:1'
      )
    ) {
      out.push(node.text);
    }
  };

  (value as Node[]).forEach(visit);

  return out.filter(Boolean);
};
const joinCount = (value: readonly unknown[]) => {
  let most = 0;
  const visit = (node: Node) => {
    const joins = ((node.authored ?? []) as Array<{ kind: string }>).filter(
      (m) => m.kind === 'join'
    ).length;

    most = Math.max(most, joins);
    (node.children as Node[] | undefined)?.forEach(visit);
  };

  (value as Node[]).forEach(visit);

  return most;
};

type Run = (tx: EditorUpdateTransaction) => void;
type Case = Readonly<{
  accepted: Node[];
  at: At;
  intents?: readonly Intent[];
  name: string;
  plainAt: At;
  run: Run;
  start: Node[];
  via?: 'update' | 'view';
}>;

const drive = (editor: Editor, at: At, run: Run, via: Case['via']) => {
  const target = via === 'view' ? createEditorView(editor) : editor;

  target.update((tx) => {
    tx.selection.set(selectionOf(at));
    run(tx);
  });
};
const typeZ = (editor: Editor) =>
  editor.update((tx) => tx.command(editorCommands.insertText, { text: 'Z' }));

const law = (c: Case) => {
  for (const intent of c.intents ?? (['edit', 'propose'] as const)) {
    it(`${c.name} in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const plain = make(decided(c.start, 'accept'), 'plain');

      drive(plain, c.plainAt, c.run, c.via);
      assert.deepEqual(unmarked(plain.read.children()), c.accepted);

      const editor = make(c.start, intent);

      drive(editor, c.at, c.run, c.via);
      const raw = expandedChildren(editor);

      assert.deepEqual(unmarked(decided(raw, 'accept')), c.accepted);
      assert.ok(joinCount(raw) <= 1, 'a line carries two joins');
      if (intent === 'propose') {
        assert.deepEqual(decided(raw, 'reject'), decided(c.start, 'reject'));
        assert.deepEqual(
          decided(raw, 'reject', 'bob'),
          decided(c.start, 'reject', 'bob')
        );
        assert.ok(changesOf(raw, 'bob').length <= 1, 'one update, one change');
      } else {
        const restored = textOf({
          children: decided(raw, 'reject', 'carol'),
        });

        for (const value of carolStruck(c.start)) {
          assert.ok(
            restored.includes(value),
            `rejecting carol keeps "${value}"`
          );
        }
      }

      typeZ(plain);
      typeZ(editor);
      assert.deepEqual(
        unmarked(decided(expandedChildren(editor), 'accept')),
        unmarked(plain.read.children()),
        'a letter typed next lands where the plain editor puts it'
      );
    });
  }
};

const backspace: Run = (tx) =>
  tx.command(editorCommands.delete, {
    direction: 'backward',
    unit: 'character',
  });
const del: Run = (tx) =>
  tx.command(editorCommands.delete, {
    direction: 'forward',
    unit: 'character',
  });
const deleteUnit =
  (direction: 'backward' | 'forward', unit: 'line' | 'word'): Run =>
  (tx) =>
    tx.command(editorCommands.delete, { direction, unit });
const fragment: Run = (tx) =>
  tx.command(editorCommands.deleteFragment, { direction: 'backward' });
const type =
  (value: string): Run =>
  (tx) =>
    tx.command(editorCommands.insertText, { text: value });
const bold: Run = (tx) =>
  tx.command(editorCommands.toggleMark, { key: 'bold', value: true });

const divider = (): Node => ({ children: [{ text: '' }], type: 'divider' });
const mention = (): Node => ({ children: [{ text: '' }], type: 'mention' });
const joinedLines = () => [p('hel'), joined(p('lo world'))];

describe('authored review tree commands', () => {
  law({
    accepted: [p({ bold: true, text: 'ab' })],
    at: [
      [[0, 0], 0],
      [[0, 2], 1],
    ],
    name: 'A1 bold over text that struck letters split',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 2],
    ],
    run: bold,
    start: [p('a', struck('x'), 'b')],
  });
  law({
    accepted: [p('ab')],
    at: [[0, 1], 1],
    name: 'S5 a letter typed inside struck letters, then Backspace, in one update',
    plainAt: [[0, 0], 1],
    run: (tx) => {
      type('Q')(tx);
      backspace(tx);
    },
    start: [p('a', struck('xyz'), 'b')],
  });
  law({
    accepted: [p('cd')],
    at: [[0, 2], 0],
    name: 'S5 Backspace twice across struck letters in one update',
    plainAt: [[0, 0], 2],
    run: (tx) => {
      backspace(tx);
      backspace(tx);
    },
    start: [p('ab', struck('xyz'), 'cd')],
  });
  law({
    accepted: [p('b')],
    at: [[0, 2], 0],
    name: 'Backspace at a leaf boundary after struck letters',
    plainAt: [[0, 0], 1],
    run: backspace,
    start: [p('a', struck('x'), 'b')],
  });
  law({
    accepted: [p('acd')],
    at: [[0, 1], 4],
    name: 'Backspace at the end of struck letters deletes the live letter before them',
    plainAt: [[0, 0], 2],
    run: backspace,
    start: [p('ab', struck('gone'), 'cd')],
  });
  law({
    accepted: [p('abd')],
    at: [[0, 1], 1],
    name: 'Delete inside struck letters deletes the live letter after them',
    plainAt: [[0, 0], 2],
    run: del,
    start: [p('ab', struck('gone'), 'cd')],
  });
  law({
    accepted: [p('b')],
    at: [[0, 2], 1],
    name: 'G1 Backspace over a grapheme that struck letters split',
    plainAt: [[0, 0], 2],
    run: backspace,
    start: [p('a', struck('x'), '\u0301b')],
  });
  law({
    accepted: [p('aQb')],
    at: [[0, 1], 1],
    name: 'a letter typed inside struck bold letters takes the live marks',
    plainAt: [[0, 0], 1],
    run: type('Q'),
    start: [p('a', { ...struck('XY'), bold: true }, 'b')],
  });
  law({
    accepted: [p('aQb')],
    at: [[0, 1], 1],
    name: 'a letter typed without marks inside struck bold letters',
    plainAt: [[0, 0], 1],
    run: (tx) =>
      tx.command(editorCommands.insertText, {
        options: { marks: false },
        text: 'Q',
      }),
    start: [p('a', { ...struck('XY'), bold: true }, 'b')],
  });
  law({
    accepted: [p('liveQ')],
    at: [[1, 0], 2],
    name: 'a letter typed in a struck line goes to the line above that stays',
    plainAt: [[0, 0], 4],
    run: type('Q'),
    start: [p('live'), struckBlock(p('gone'))],
  });
  law({
    accepted: [p('abcd')],
    at: [[0, 0], 2],
    name: 'Delete at the end of a line before a struck line',
    plainAt: [[0, 0], 2],
    run: del,
    start: [p('ab'), struckBlock(p('gone')), p('cd')],
  });
  law({
    accepted: [p('ab'), p(''), p('cd')],
    at: [[0, 0], 2],
    name: "Delete at the end of a line before an empty line and another author's pending empty line",
    plainAt: [[0, 0], 2],
    run: del,
    start: [p('ab'), p(''), { ...p(''), authored: [mark('split')] }, p('cd')],
  });
  for (const via of ['update', 'view'] as const) {
    law({
      accepted: [p('keepZ'), p('tail')],
      at: [
        [[1, 0], 0],
        [[2, 0], 2],
      ],
      name: `T1 typing over struck lines through ${via === 'view' ? 'a view' : 'the editor'}`,
      plainAt: [[0, 0], 4],
      run: type('Z'),
      start: [p('keep'), struckBlock(p('cd')), struckBlock(p('ef')), p('tail')],
      via,
    });
  }
  law({
    accepted: [p('')],
    at: [
      [[0, 0], 0],
      [[1, 0], 2],
    ],
    name: 'T4 deleting a range over both blocks of a pending join',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 4],
    ],
    run: fragment,
    start: [p('ab'), joined(p('cd'))],
  });
  law({
    accepted: [h(' world')],
    at: [
      [[0, 0], 0],
      [[1, 0], 2],
    ],
    name: 'T7 a paragraph joined to a heading keeps the heading',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 5],
    ],
    run: fragment,
    start: [h('hel'), joined(p('lo world'))],
  });
  law({
    accepted: [h('cd')],
    at: [
      [[0, 0], 0],
      [[0, 0], 2],
    ],
    intents: ['edit'],
    name: 'E1 deleting the whole heading a joined paragraph merges into',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 2],
    ],
    run: fragment,
    start: [h('ab'), joined(p('cd'))],
  });
  law({
    accepted: [h('cd')],
    at: [
      [[0, 1], 0],
      [[0, 1], 1],
    ],
    intents: ['edit'],
    name: 'E3b deleting the plain rest of a heading whose other text Ann struck before Alice joined into it',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 1],
    ],
    run: fragment,
    start: [h(annStruck('a'), 'b'), joined(p('cd'), 'alice')],
  });
  law({
    accepted: [h('cd')],
    at: [
      [[0, 0], 0],
      [[0, 0], 1],
    ],
    intents: ['edit'],
    name: 'E3d deleting the plain start of a heading whose rest Ann struck before Alice joined into it',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 1],
    ],
    run: fragment,
    start: [h('b', annStruck('a')), joined(p('cd'), 'alice')],
  });
  law({
    accepted: [h('ef')],
    at: [
      [[0, 0], 0],
      [[0, 0], 2],
    ],
    intents: ['edit'],
    name: 'E5 deleting the heading two chained joins merge into',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 2],
    ],
    run: fragment,
    start: [h('ab'), joined(p(''), 'alice'), joined(p('ef'))],
  });
  law({
    accepted: [p('ab'), p('')],
    at: [[0, 0], 2],
    name: 'J2 Enter at the end of a line before a struck line',
    plainAt: [[0, 0], 2],
    run: (tx) => tx.command(editorCommands.insertBreak),
    start: [p('ab'), struckBlock(p('gone'))],
  });
  law({
    accepted: [p('cf')],
    at: [
      [[0, 1], 0],
      [[1, 0], 1],
    ],
    name: 'deleting a range from struck letters that end a line joins the next line',
    plainAt: [
      [[0, 0], 1],
      [[1, 0], 1],
    ],
    run: fragment,
    start: [p('c', struck('d')), p('ef')],
  });
  law({
    accepted: [p('efab')],
    at: [
      [[0, 0], 2],
      [[2, 0], 0],
    ],
    name: 'deleting a range over a whole line joins the lines around it',
    plainAt: [
      [[0, 0], 2],
      [[2, 0], 0],
    ],
    run: fragment,
    start: [p('ef'), p('gh'), p('ab')],
  });
  law({
    accepted: [p('abcd')],
    at: [[1, 0, 0], 0],
    name: "U2 Backspace at the start of a quote's line another author's pending unwrap lifts out",
    plainAt: [[1, 0], 0],
    run: backspace,
    start: [p('ab'), { ...q(p('cd')), authored: [mark('unwrap')] }],
  });
  law({
    accepted: [p('af')],
    at: [
      [[0, 0, 0], 1],
      [[1, 0], 1],
    ],
    name: "U3 deleting a range out of a quote another author's pending unwrap dissolves",
    plainAt: [
      [[0, 0], 1],
      [[1, 0], 1],
    ],
    run: fragment,
    start: [{ ...q(p('ab')), authored: [mark('unwrap')] }, p('ef')],
  });
  law({
    accepted: [p('ad')],
    at: [
      [[0, 0], 1],
      [[1, 0, 0], 1],
    ],
    name: "U4 deleting a range into a quote another author's pending unwrap dissolves",
    plainAt: [
      [[0, 0], 1],
      [[1, 0], 1],
    ],
    run: fragment,
    start: [p('ab'), { ...q(p('cd')), authored: [mark('unwrap')] }],
  });
  law({
    accepted: [p('xab'), p('f')],
    at: [
      [[1, 0, 0], 0],
      [[2, 0], 1],
    ],
    name: "U5 deleting a range that empties a quote another author's pending unwrap dissolves",
    plainAt: [
      [[1, 0], 0],
      [[2, 0], 1],
    ],
    run: fragment,
    start: [p('xab'), { ...q(p('cd')), authored: [mark('unwrap')] }, p('ef')],
  });
  law({
    accepted: [p('xab'), p('f')],
    at: [
      [[1, 0, 0], 0],
      [[2, 0], 1],
    ],
    name: "U6 deleting a range that empties a quote another author's pending unwrap dissolves and a third author's pending deletion strikes",
    plainAt: [
      [[1, 0], 0],
      [[2, 0], 1],
    ],
    run: fragment,
    start: [
      p('xab'),
      {
        ...q(p('cd')),
        authored: [
          mark('unwrap'),
          { ...mark('delete'), author: 'dana', change: 'dana:1' },
        ],
      },
      p('ef'),
    ],
  });
  law({
    accepted: [p('abd'), p('ef')],
    at: [[0, 0], 2],
    name: 'Delete at a line end joins a line that starts with struck letters, and the caret stays before its live text',
    plainAt: [[0, 0], 2],
    run: del,
    start: [p('ab'), p(struck('c'), 'd'), p('ef')],
  });
  law({
    accepted: [p('')],
    at: [
      [[0, 0], 0],
      [[1, 1], 2],
    ],
    name: "deleting everything removes live letters inside another author's struck line",
    plainAt: [
      [[0, 0], 0],
      [[1, 0], 2],
    ],
    run: fragment,
    start: [p('ab'), { ...p(struck('ef'), 'gh'), authored: [mark('delete')] }],
  });
  law({
    accepted: [q(p('h'))],
    at: [
      [[3, 0], 1],
      [[0, 0, 0], 0],
    ],
    name: 'deleting a range from a quote across a line and a second quote keeps one quote',
    plainAt: [
      [[3, 0], 1],
      [[0, 0, 0], 0],
    ],
    run: fragment,
    start: [q(p('ab')), p('cd'), q(p('ef')), p('gh')],
  });
  law({
    accepted: [p('ab'), q(p(''), p('f'))],
    at: [
      [[1, 0, 1], 0],
      [[1, 0, 1], 1],
    ],
    name: 'deleting the one live letter after struck letters leaves the caret on that line',
    plainAt: [
      [[1, 0, 0], 0],
      [[1, 0, 0], 1],
    ],
    run: fragment,
    start: [p('ab'), q(p(struck('c'), 'd'), p(struck('e'), 'f'))],
  });
  // Rejecting Bob's split waits for Carol's join here too, as in J1.
  law({
    accepted: [p('a'), p('')],
    at: [[1, 0], 0],
    intents: ['edit'],
    name: 'Enter inside a struck line that a joined line follows puts the caret on the new line',
    plainAt: [[0, 0], 1],
    run: (tx) => tx.command(editorCommands.insertBreak),
    start: [p('a', struck('b')), struckBlock(p('cd')), joined(p(struck('ef')))],
  });
  law({
    accepted: [p('')],
    at: [[0, 0], 1],
    name: 'a letter typed where every line is struck lands in the line the document completes',
    plainAt: [[0, 0], 0],
    run: () => {},
    start: [struckBlock(p('ab'))],
  });
  law({
    accepted: [q(p('')), p('cd')],
    at: [[0, 0, 0], 1],
    name: 'a caret in a quote whose only line is struck stays in the quote when lines follow it',
    plainAt: [[0, 0, 0], 0],
    run: () => {},
    start: [q(struckBlock(p('ab'))), p('cd')],
  });
  law({
    accepted: [q(p(''), p(''))],
    at: [[0, 0, 0], 1],
    name: 'S7 Enter in a quote whose only line is struck',
    plainAt: [[0, 0, 0], 0],
    run: (tx) => tx.command(editorCommands.insertBreak),
    start: [q(struckBlock(p('ab')))],
  });
  // In Suggesting, the resolver makes rejecting Bob's split wait for Carol's
  // join, so only Editing runs here until that wait is settled.
  law({
    accepted: [p('ab'), p('cd')],
    at: [[1, 0], 0],
    intents: ['edit'],
    name: 'J1 Enter where a pending join removed the line break',
    plainAt: [[0, 0], 2],
    run: (tx) => tx.command(editorCommands.insertBreak),
    start: [p('ab'), joined(p('cd'))],
  });
  law({
    accepted: [p(' world')],
    at: [[1, 0], 2],
    name: 'K1 word Backspace inside a joined line reaches across the join',
    plainAt: [[0, 0], 5],
    run: deleteUnit('backward', 'word'),
    start: joinedLines(),
  });
  law({
    accepted: [p('helo world')],
    at: [[1, 0], 0],
    name: 'K2 Backspace at a pending join deletes the letter before it',
    plainAt: [[0, 0], 3],
    run: backspace,
    start: joinedLines(),
  });
  law({
    accepted: [p('hel world')],
    at: [[0, 0], 3],
    name: 'K3 word Delete at a pending join reaches into the joined line',
    plainAt: [[0, 0], 3],
    run: deleteUnit('forward', 'word'),
    start: joinedLines(),
  });
  law({
    accepted: [p('helo world')],
    at: [[0, 0], 3],
    name: 'K4 Delete at a pending join deletes the letter after it',
    plainAt: [[0, 0], 3],
    run: del,
    start: joinedLines(),
  });
  law({
    accepted: [p(' world')],
    at: [[1, 0], 2],
    name: 'K5 line Backspace inside a joined line reaches across the join',
    plainAt: [[0, 0], 5],
    run: deleteUnit('backward', 'line'),
    start: joinedLines(),
  });
  law({
    accepted: [p('helXlo world')],
    at: [[1, 0], 0],
    name: 'K6 typing at a pending join',
    plainAt: [[0, 0], 3],
    run: type('X'),
    start: joinedLines(),
  });
  law({
    accepted: [p('xlive')],
    at: [[1, 1, 0], 0],
    name: "T3 E Backspace after a quote's struck first line merges out of the quote",
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), q(struckBlock(p('gone')), p('live'))],
  });
  law({
    accepted: [p('xlive')],
    at: [[1, 1, 0], 0],
    name: "E Backspace after a quote's struck first heading",
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), q(struckBlock(h('gone')), p('live'))],
  });
  law({
    accepted: [q(p('live'))],
    at: [[0, 1, 0], 0],
    name: 'D Backspace after a struck first line at the document start',
    plainAt: [[0, 0, 0], 0],
    run: backspace,
    start: [q(struckBlock(p('gone')), p('live'))],
  });
  law({
    accepted: [p('xlive'), q(p('more'))],
    at: [[1, 1, 0], 0],
    name: 'Q1 E with a later line in the quote',
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), q(struckBlock(p('gone')), p('live'), p('more'))],
  });
  law({
    accepted: [p('abd')],
    at: [[2, 0], 0],
    name: 'Backspace past a struck line, then Delete, in one update deletes the letter after the join',
    plainAt: [[1, 0], 0],
    run: (tx) => {
      backspace(tx);
      del(tx);
    },
    start: [p('ab'), struckBlock(p('gone')), p('cd')],
  });
  law({
    accepted: [p('NZ'), p('gh')],
    at: [[0, 0], 1],
    name: "a letter typed after live text inside another author's struck line",
    plainAt: [[0, 0], 1],
    run: type('Z'),
    start: [{ ...p('N', struck('ab')), authored: [mark('delete')] }, p('gh')],
  });
  law({
    accepted: [q(p('ac'))],
    at: [[0, 2, 0], 0],
    name: 'Backspace past a struck line inside a quote joins within the quote',
    plainAt: [[0, 1, 0], 0],
    run: backspace,
    start: [q(p('a'), struckBlock(p('b')), p('c'))],
  });
  law({
    accepted: [p('N'), p('XYh')],
    at: [
      [[3, 0], 1],
      [[1, 0], 1],
    ],
    name: 'deleting a range from inside a struck line keeps the line break before it',
    plainAt: [
      [[2, 0], 1],
      [[1, 0], 0],
    ],
    run: (tx) => {
      fragment(tx);
      type('XY')(tx);
    },
    start: [
      { ...p('N', struck('ab')), authored: [mark('delete')] },
      struckBlock(p('cd')),
      p(struck('e'), 'f'),
      p('gh'),
    ],
  });
  law({
    accepted: [p('ghef')],
    at: [
      [[3, 0], 0],
      [[1, 0], 1],
    ],
    name: 'deleting a range from inside a struck line before a pending join',
    plainAt: [
      [[1, 0], 0],
      [[0, 0], 2],
    ],
    run: fragment,
    start: [p('gh'), struckBlock(p('ab')), joined(p('cd')), p('ef')],
  });
  law({
    accepted: [p('aQ'), p('b')],
    at: [[0, 0], 1],
    name: 'a letter and Enter in one update',
    plainAt: [[0, 0], 1],
    run: (tx) => {
      type('Q')(tx);
      tx.command(editorCommands.insertBreak);
    },
    start: [p('ab')],
  });
  law({
    accepted: [p('xlive')],
    at: [[1, 0, 0], 0],
    name: "Q2 Backspace at a quote's only line merges out of the quote",
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), q(p('live'))],
  });
  law({
    accepted: [p('xlive'), q(p('more'))],
    at: [[1, 0, 0], 0],
    name: "Q2 Backspace at a quote's first line merges it out before a later line",
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), q(p('live'), p('more'))],
  });
  law({
    accepted: [q(p('aafter'))],
    at: [[0, 0, 0], 1],
    name: "T6 Delete at the end of a quote's line before its struck last line",
    plainAt: [[0, 0, 0], 1],
    run: del,
    start: [q(p('a'), struckBlock(p('g'))), p('after')],
  });
  law({
    accepted: [p('x'), p('live')],
    at: [[3, 0], 0],
    name: 'T9 Backspace past a struck line reaches the divider before it',
    plainAt: [[2, 0], 0],
    run: backspace,
    start: [p('x'), divider(), struckBlock(p('gone')), p('live')],
  });
  law({
    accepted: [p('live'), p('x')],
    at: [[0, 0], 4],
    name: 'T9 Delete past a struck line reaches the divider after it',
    plainAt: [[0, 0], 4],
    run: del,
    start: [p('live'), struckBlock(p('gone')), divider(), p('x')],
  });
  law({
    accepted: [p('')],
    at: [
      [[0, 0], 0],
      [[2, 0], 1],
    ],
    name: 'T10 select all with a struck first line, then Backspace',
    plainAt: [
      [[0, 0], 0],
      [[1, 0], 1],
    ],
    run: fragment,
    start: [struckBlock(p('gone')), p('a'), p('b')],
  });
  law({
    accepted: [p('')],
    at: [
      [[0, 0], 0],
      [[2, 0], 4],
    ],
    name: 'T10 select all with a struck last line, then Backspace',
    plainAt: [
      [[0, 0], 0],
      [[1, 0], 1],
    ],
    run: fragment,
    start: [p('a'), p('b'), struckBlock(p('gone'))],
  });
  law({
    accepted: [p('Q')],
    at: [
      [[0, 0], 0],
      [[2, 0], 1],
    ],
    name: 'P5 select all over a struck line, then type',
    plainAt: [
      [[0, 0], 0],
      [[1, 0], 1],
    ],
    run: type('Q'),
    start: [p('a'), struckBlock(p('gone')), p('b')],
  });
  law({
    accepted: [p('')],
    at: [
      [[0, 0], 0],
      [[0, 2], 1],
    ],
    name: 'S2 deleting a range removes the mention inside it',
    plainAt: [
      [[0, 0], 0],
      [[0, 2], 1],
    ],
    run: fragment,
    start: [p('a', mention(), 'b')],
  });
  law({
    accepted: [p('ba')],
    at: [[0, 2], 0],
    name: 'transpose swaps the live letters around struck ones',
    plainAt: [[0, 0], 1],
    run: (tx) => tx.command(editorCommands.transposeCharacter),
    start: [p('a', struck('x'), 'b')],
  });
  law({
    accepted: [q(p('ab'), p('ef'), p('gh'))],
    at: [[1, 0], 0],
    intents: ['edit'],
    name: 'M1 a word Backspace that empties a pending join’s target keeps the joining line in the target’s place after a line moved before it',
    plainAt: [[0, 2, 0], 2],
    run: deleteUnit('backward', 'word'),
    start: [q(p('ab'), p('ef'), p('cd')), joined(p('gh'))],
  });
  law({
    accepted: [p('cd'), p('ef')],
    at: [
      [[0, 0], 0],
      [[0, 0], 2],
    ],
    name: 'M2 deleting the text of a pending join’s target keeps the joining line before a line moved between them',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 2],
    ],
    run: fragment,
    start: [p('ab'), follower(p('ef')), joined(p('cd'))],
  });
  law({
    accepted: [q(p('cdefab'))],
    at: [[0, 1, 0], 0],
    name: 'M3 Backspace at the start of a line moved between a pending join’s halves merges it into the joined line',
    plainAt: [[0, 1, 0], 0],
    run: backspace,
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cf'), p('ab'))],
    at: [
      [[0, 0, 0], 1],
      [[0, 2, 0], 1],
    ],
    name: 'M6 a range delete across a pending join keeps the line moved between its halves',
    plainAt: [
      [[0, 0, 0], 1],
      [[0, 0, 0], 3],
    ],
    run: fragment,
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cdef'), p('Xb'))],
    at: [
      [[0, 1, 0], 0],
      [[0, 1, 0], 1],
    ],
    intents: ['propose'],
    name: 'M7 typing over a letter of a line one’s own Editing move placed between a pending join’s halves',
    plainAt: [
      [[0, 1, 0], 0],
      [[0, 1, 0], 1],
    ],
    run: type('X'),
    start: [q(p('cd'), follower(p('ab'), 'bob'), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cdf'), p('ab'))],
    at: [[0, 0, 0], 2],
    name: 'M8 Delete at the end of a pending join’s target keeps the line moved between its halves',
    plainAt: [[0, 0, 0], 2],
    run: del,
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cgh'))],
    at: [
      [[0, 0, 0], 1],
      [[0, 3, 0], 0],
    ],
    name: 'M9 a range delete from a pending join’s target to the line after its followers merges that line in',
    plainAt: [
      [[0, 0, 0], 1],
      [[0, 2, 0], 0],
    ],
    run: fragment,
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')), p('gh'))],
  });
  law({
    accepted: [q(p('cdef'), p('abgh'))],
    at: [[0, 2, 0], 0],
    name: 'M10 Backspace at the start of a line moved between a pending join’s halves merges it into the moved line before it',
    plainAt: [[0, 2, 0], 0],
    run: backspace,
    start: [q(p('cd'), follower(p('ab')), follower(p('gh')), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cdef'), p('aXb'))],
    at: [[0, 1, 0], 1],
    name: 'M11 typing inside a line one’s own suggestion placed between a pending join’s halves',
    plainAt: [[0, 1, 0], 1],
    run: type('X'),
    start: [q(p('cd'), follower(p('ab'), 'bob', 'bob:7'), joined(p('ef')))],
  });
  // In Suggesting, rejecting Bob's split waits for Carol's join, as in J1.
  law({
    accepted: [q(p('c'), p('def'), p('ab'))],
    at: [[0, 0, 0], 1],
    intents: ['edit'],
    name: 'M12 Enter in a pending join’s target breaks it before the lines moved between the join’s halves',
    plainAt: [[0, 0, 0], 1],
    run: (tx) => tx.command(editorCommands.insertBreak),
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cdef'), p('a'), p('b'))],
    at: [[0, 1, 0], 1],
    name: 'M13 Enter inside a line moved between a pending join’s halves breaks that line',
    plainAt: [[0, 1, 0], 1],
    run: (tx) => tx.command(editorCommands.insertBreak),
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cde'), p('f'), p('gh'))],
    at: [[0, 1, 0], 1],
    name: 'M14 Enter inside a pending join’s joining half with nothing moved between its halves',
    plainAt: [[0, 0, 0], 3],
    run: (tx) => tx.command(editorCommands.insertBreak),
    start: [q(p('cd'), joined(p('ef')), p('gh'))],
  });
  law({
    accepted: [q(p('cde', link('X'), 'f'), p('ab'))],
    at: [[0, 2, 0], 1],
    name: 'M15 pasting a link inside a pending join’s joining half with a line moved between its halves',
    plainAt: [[0, 0, 0], 3],
    run: (tx) =>
      tx.command(editorCommands.replaceSlice, {
        slice: ContentSlice.fromJSON({
          content: [p(link('X'))],
          openEnd: 1,
          openStart: 1,
        }),
      }),
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cdef'), p('ab'), p('gh'))],
    at: [[0, 2, 0], 0],
    name: 'M16 Backspace then Enter at the start of the second line moved between a pending join’s halves leaves the lines as they were',
    plainAt: [[0, 2, 0], 0],
    run: (tx) => {
      backspace(tx);
      tx.command(editorCommands.insertBreak);
    },
    start: [q(p('cd'), follower(p('ab')), follower(p('gh')), joined(p('ef')))],
  });
  law({
    accepted: [q(p('cXij'))],
    at: [
      [[0, 0, 0], 1],
      [[0, 4, 0], 0],
    ],
    name: 'M17 typing over two pending joins and a line moved between the first one’s halves',
    plainAt: [
      [[0, 0, 0], 1],
      [[0, 2, 0], 0],
    ],
    run: type('X'),
    start: [
      q(
        p('cd'),
        follower(p('ab')),
        joined(p('ef')),
        joined(p('gh'), 'dora'),
        p('ij')
      ),
    ],
  });
  law({
    accepted: [p('cdef'), p('abgh')],
    at: [[3, 0], 0],
    name: 'M23 Backspace at the line after a line moved between a pending join’s halves merges it into the moved line',
    plainAt: [[2, 0], 0],
    run: backspace,
    start: [p('cd'), follower(p('ab')), joined(p('ef')), p('gh')],
  });
  law({
    accepted: [p('cdef'), p('abgh')],
    at: [[1, 0], 2],
    name: 'M24 Delete at the end of a line moved between a pending join’s halves merges the line after it',
    plainAt: [[1, 0], 2],
    run: del,
    start: [p('cd'), follower(p('ab')), joined(p('ef')), p('gh')],
  });
  law({
    accepted: [q(p('cdef'), p('abgh'))],
    at: [[0, 3, 0], 0],
    name: 'M25 Backspace at the line after a line moved between a pending join’s halves in a quote merges it into the moved line',
    plainAt: [[0, 2, 0], 0],
    run: backspace,
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')), p('gh'))],
  });
  law({
    accepted: [q(p('cdef'), p('abgh'))],
    at: [[0, 1, 0], 2],
    name: 'M26 Delete at the end of a line moved between a pending join’s halves in a quote merges the line after it',
    plainAt: [[0, 1, 0], 2],
    run: del,
    start: [q(p('cd'), follower(p('ab')), joined(p('ef')), p('gh'))],
  });
  law({
    accepted: [q(p('cdef'), p('abgh'), p('ij'))],
    at: [[0, 1, 0], 2],
    name: 'Delete at the end of a moved line merges the line after it when the next move lands after a struck line',
    plainAt: [[0, 1, 0], 2],
    run: del,
    start: [
      q(
        p('cd'),
        follower(p('ab')),
        joined(p('ef')),
        p('gh'),
        follower(p('ij'), 'erin', '~edit:erin', 'dora:1'),
        joined(p(struck('kl')), 'dora')
      ),
    ],
  });
  law({
    accepted: [p('h'), p('ab'), q(p('ij'))],
    at: [
      [[0, 0], 1],
      [[4, 0], 0],
    ],
    name: 'M4 a range delete up to a pending join past a suggested move leaves the caret before the joined text',
    plainAt: [
      [[0, 0], 0],
      [[1, 0], 1],
    ],
    run: fragment,
    start: ((): Node[] => {
      const by = (kind: string, change: string) => ({
        ...mark(kind),
        change,
      });

      return [
        {
          ...p({ authored: [by('delete', 'carol:2')], text: 'ab' }),
          authored: [by('delete', 'carol:2')],
        },
        p('cd'),
        p('e', struck('f')),
        {
          ...p({ authored: [by('insert', 'carol:2')], text: 'ab' }),
          authored: [
            {
              ...by('insert', 'carol:2'),
              follows: JSON.stringify(['carol:1', 1]),
            },
          ],
        },
        {
          ...p(
            { authored: [mark('delete'), mark('insert')], text: 'g' },
            { authored: [mark('insert')], text: 'h' }
          ),
          authored: [mark('insert'), mark('join')],
        },
        q(struckBlock(p('gh')), p('ij')),
      ];
    })(),
  });

  for (const intent of ['edit', 'propose'] as const) {
    it(`M27 Backspace at a moved line that holds an exclusive root's owner ${intent === 'edit' ? 'records one owner in Editing' : 'is refused in Suggesting'}`, () => {
      const chip = {
        childRoots: { note: 'r' },
        children: [{ text: 'k' }],
        type: 'chip',
      };
      const editor = make(
        {
          children: [p('cd'), follower(p('ab', chip, 'z')), joined(p('ef'))],
          roots: { r: [p('ROOT')] },
        },
        intent,
        [],
        ChipBlocks
      );
      const before = expandedChildren(editor);
      const refusals: string[] = [];

      editor.api.authored.subscribeRefusals(({ code }) => refusals.push(code));
      drive(editor, [[1, 0], 0], backspace, 'update');

      if (intent === 'propose') {
        assert.deepEqual(refusals, ['unrepresentable']);
        assert.deepEqual(expandedChildren(editor), before);
      } else {
        assert.deepEqual(refusals, []);
        assert.deepEqual(unmarked(expandedChildren(editor)), [
          p('cd'),
          p('efab', chip, 'z'),
        ]);
      }
    });

    it(`M5 a letter typed before a rejected move’s held letter stays out of the held leaf in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const editor = make(
        [
          p(''),
          {
            ...p('a', held('b')),
            authored: [{ ...mark('split'), change: 'carol:2' }],
          },
          p('cd'),
        ],
        intent
      );

      drive(editor, [[1, 1], 0], type('Z'), 'update');
      const line = (editor.read.children() as Node[])[1];

      assert.equal(textOf(line), 'aZb');
      assert.deepEqual((line.children as Node[]).at(-1), held('b'));
    });

    it(`a letter typed before a rejected move’s held letter adopts the written line, live and on a fresh load, in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const editor = make(
        [
          p(''),
          {
            ...p('a', held('b')),
            authored: [{ ...mark('split'), change: 'carol:2' }],
          },
          p('cd'),
        ],
        intent
      );
      const before = readLedgerWork();

      drive(editor, [[1, 1], 0], type('Z'), 'update');
      const work = readLedgerWork();

      // The gate takes the frame's write for the held line's window.
      assert.ok(work.writtenRuns > before.writtenRuns, 'no written run');
      assert.equal(work.resolvedRuns - before.resolvedRuns, 0);
      assert.deepEqual(
        ((editor.read.children() as Node[])[1].children as Node[]).at(-1),
        held('b')
      );

      const shown = (target: Editor) =>
        (
          createEditorView(target, {
            authored: { preview: 'proposed' },
          }).read.children() as Node[]
        ).map(textOf);

      assert.deepEqual(shown(editor), ['', 'aZb', 'cd']);
      assert.deepEqual(
        shown(make(editor.read.value().children as Node[], intent)),
        ['', 'aZb', 'cd']
      );
    });
  }

  for (const intent of ['edit', 'propose'] as const) {
    const mode = intent === 'edit' ? 'Editing' : 'Suggesting';

    it(`K6 accepting after typing at a pending join keeps the caret after the letter in ${mode}`, () => {
      const editor = make(joinedLines(), intent);

      drive(editor, [[1, 0], 0], type('X'), 'update');
      authoredTestApi(editor).decide({
        action: 'accept',
        changes: changesOf(editor.read.children()),
      });
      typeZ(editor);

      assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
        p('helXZlo world'),
      ]);
    });

    // A mounted editor resolves its implicit target from the DOM caret, a
    // stored position, so the frame places it before the command reads it.
    it(`a letter typed with the browser's caret inside a struck block lands at the end of the line before it in ${mode}`, () => {
      const editor = make([p('ab'), struckBlock(p('gone')), p('cd')], intent);
      const point = { offset: 2, path: [1, 0] };

      editor.update((tx) => {
        tx.selection.set(selectionOf([[1, 0], 2]));
      });
      withEditorTargetRuntime(
        editor,
        {
          resolveImplicitTarget: () => ({
            anchor: point,
            focus: point,
            kind: 'text',
          }),
        },
        () => typeZ(editor)
      );

      assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
        p('abZ'),
        p('cd'),
      ]);
    });

    for (const after of [[p('cd')], []]) {
      it(`a letter typed with the browser's caret inside a struck block away from the stored caret lands at the end of the line before it, ${after.length} lines after, in ${mode}`, () => {
        const editor = make(
          [p('ab'), struckBlock(p('gone')), ...after],
          intent
        );
        const point = { offset: 2, path: [1, 0] };

        editor.update((tx) => {
          tx.selection.set(selectionOf([[0, 0], 0]));
        });
        withEditorTargetRuntime(
          editor,
          {
            resolveImplicitTarget: () => ({
              anchor: point,
              focus: point,
              kind: 'text',
            }),
          },
          () => typeZ(editor)
        );

        assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
          p('abZ'),
          ...after,
        ]);
      });
    }

    it(`bold over the live letters before a struck letter leaves the live letters after it plain in ${mode}`, () => {
      const start = [p('a', struck('x'), 'b')];
      const plain = make(unmarked(decided(start, 'accept')) as Node[], 'plain');
      const editor = make(start, intent);

      drive(
        plain,
        [
          [[0, 0], 0],
          [[0, 0], 1],
        ],
        bold,
        'update'
      );
      drive(
        editor,
        [
          [[0, 0], 0],
          [[0, 0], 1],
        ],
        bold,
        'update'
      );

      assert.deepEqual(
        unmarked(decided(editor.read.children(), 'accept')),
        unmarked(plain.read.children())
      );
    });

    it(`bold over a live letter after a struck letter leaves the live letters around it plain in ${mode}`, () => {
      const start = [p('a', struck('x'), 'bc', struck('y'), 'd')];
      const plain = make(unmarked(decided(start, 'accept')) as Node[], 'plain');
      const editor = make(start, intent);

      drive(
        plain,
        [
          [[0, 0], 1],
          [[0, 0], 2],
        ],
        bold,
        'update'
      );
      drive(
        editor,
        [
          [[0, 2], 0],
          [[0, 2], 1],
        ],
        bold,
        'update'
      );

      assert.deepEqual(
        unmarked(decided(editor.read.children(), 'accept')),
        unmarked(plain.read.children())
      );
    });

    it(`bold across a struck letter after another struck letter bolds the live letters on both sides in ${mode}`, () => {
      const start = [p('c', struck('y'), 'a', struck('x'), 'bd')];
      const plain = make(unmarked(decided(start, 'accept')) as Node[], 'plain');
      const editor = make(start, intent);

      drive(
        plain,
        [
          [[0, 0], 1],
          [[0, 0], 3],
        ],
        bold,
        'update'
      );
      drive(
        editor,
        [
          [[0, 2], 0],
          [[0, 4], 1],
        ],
        bold,
        'update'
      );

      assert.deepEqual(
        unmarked(decided(editor.read.children(), 'accept')),
        unmarked(plain.read.children())
      );
    });

    it(`the browser's transpose swaps the live letters around struck ones in ${mode}`, () => {
      const editor = make([p('a', struck('x'), 'b')], intent);

      editor.update((tx) => tx.selection.set(selectionOf([[0, 2], 0])));
      applyEditableCommand({
        command: { kind: 'transpose-character' },
        editor,
      });

      assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
        p('ba'),
      ]);
    });

    it(`T1 typing over struck lines in a named root in ${mode}`, () => {
      const editor = make(
        {
          children: [p('main')],
          roots: {
            header: [
              p('keep'),
              struckBlock(p('cd')),
              struckBlock(p('ef')),
              p('tail'),
            ],
          },
        },
        intent,
        [],
        HeaderBlocks
      );

      createEditorView(editor, { root: 'header' }).update((tx) => {
        tx.selection.set(
          selectionOf([
            [[1, 0], 0],
            [[2, 0], 2],
          ])
        );
        type('Z')(tx);
      });
      authoredTestApi(editor).decide({
        action: 'accept',
        changes: changesOf(editor.read.root('header')),
      });

      assert.deepEqual(editor.read.root('header'), [p('keepZ'), p('tail')]);
      assert.deepEqual(editor.read.children(), [p('main')]);
    });

    it(`Enter after struck text in a named root types on the new line in ${mode}`, () => {
      const editor = make(
        { children: [p('main')], roots: { header: [p(struck('ab'))] } },
        intent,
        [],
        HeaderBlocks
      );
      const view = createEditorView(editor, { root: 'header' });

      view.update((tx) => {
        tx.selection.set(selectionOf([[0, 0], 2]));
        tx.command(editorCommands.insertBreak);
      });
      view.update((tx) => type('Z')(tx));
      authoredTestApi(editor).decide({
        action: 'accept',
        changes: changesOf(editor.read.root('header')),
      });

      assert.deepEqual(editor.read.root('header'), [p(''), p('Z')]);
      assert.deepEqual(editor.read.children(), [p('main')]);
    });

    const refusesWhole = (start: Node[], at: At, run: Run) => {
      const editor = make(start, intent);
      const before = expandedChildren(editor);
      const refusals: string[] = [];

      editor.api.authored.subscribeRefusals(({ code }) => refusals.push(code));
      drive(editor, at, run, 'update');

      assert.deepEqual(refusals, ['unrepresentable']);
      assert.deepEqual(expandedChildren(editor), before);
      assert.deepEqual(
        decided(expandedChildren(editor), 'accept'),
        decided(start, 'accept')
      );
      assert.deepEqual(
        decided(expandedChildren(editor), 'reject'),
        decided(start, 'reject')
      );
    };
    const enters: Array<[string, Node, At]> = [
      ['at', p('ef'), [[0, 2, 0], 0]],
      ['inside', p('ef'), [[0, 2, 0], 1]],
      ['at the end of', p('ef'), [[0, 2, 0], 2]],
      ['inside a link in', p('e', link('fg'), 'h'), [[0, 2, 1, 0], 1]],
      ['after a link that ends', p('e', link('fg'), ''), [[0, 2, 2], 0]],
    ];

    for (const [where, half, at] of enters) {
      it(`Enter ${where} the joined half of a line with moved lines between its halves refuses the whole update in ${mode}`, () => {
        refusesWhole(
          [q(p('cd'), follower(p('ab')), joined(half))],
          at,
          (tx) => {
            tx.command(editorCommands.insertBreak);
            type('X')(tx);
          }
        );
      });
    }

    const refused: Array<[string, Node[], At, Run]> = [
      [
        'a range delete into a joined line with a line moved between its halves',
        [
          q(
            p('cd'),
            follower(p('ab')),
            joined(p('ef')),
            p('gh'),
            follower(p('ij'), 'erin', '~edit:erin', 'dora:1'),
            joined(p('kl'), 'dora')
          ),
        ],
        [
          [[0, 0, 0], 1],
          [[0, 3, 0], 1],
        ],
        fragment,
      ],
      [
        'a block inserted at the end of a joined line with a line moved between its halves',
        [q(p('cd'), follower(p('ab')), joined(p('ef')), p('gh'))],
        [[0, 2, 0], 2],
        (tx) => tx.command(editorCommands.insertNodes, { nodes: [p('N')] }),
      ],
      [
        'Enter inside a joined half whose target’s text is struck, with a line moved between them,',
        [q(p(struck('cd')), follower(p('ab')), joined(p('ef')))],
        [[0, 2, 0], 1],
        (tx) => tx.command(editorCommands.insertBreak),
      ],
    ];

    for (const [name, start, at, run] of refused) {
      it(`${name} refuses the whole update in ${mode}`, () => {
        refusesWhole(start, at, run);
      });
    }

    it(`D1 a drag of live text into a struck line lands at the end of the line above in ${mode}`, () => {
      const editor = make([p('ab'), struckBlock(p('gone')), p('cd')], intent, [
        transfer(),
      ]);

      editor.api.transfer.move({
        range: selectionOf([
          [[0, 0], 0],
          [[0, 0], 1],
        ]),
        to: { point: { offset: 2, path: [1, 0] } },
      });

      assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
        p('ba'),
        p('cd'),
      ]);
    });

    it(`D2 a dragged line keeps another author's insertion in ${mode}`, () => {
      const start = [
        p('a', { authored: [mark('insert')], text: 'x' }, 'b'),
        p('cd'),
        p('ef'),
      ];
      const editor = make(start, intent, [transfer()]);

      editor.api.transfer.move({
        nodes: [editor.key([0])],
        to: { edge: 'after', key: editor.key([2]) },
      });
      const raw = expandedChildren(editor);

      assert.deepEqual(unmarked(decided(raw, 'accept')), [
        p('cd'),
        p('ef'),
        p('axb'),
      ]);
      assert.deepEqual(
        decided(raw, 'reject', intent === 'edit' ? 'carol' : 'bob'),
        intent === 'edit' ? [p('cd'), p('ef'), p('ab')] : start
      );
    });

    it(`D3 a drag of text holding another author's insertion or deletion moves it in ${mode}`, () => {
      const cases = [
        {
          accepted: [p('b'), p('cdaxy')],
          end: 2,
          rejected: [p('b'), p('cda')],
          start: [
            p('a', { authored: [mark('insert')], text: 'xy' }, 'b'),
            p('cd'),
          ],
        },
        {
          accepted: [p('b'), p('cda')],
          end: 1,
          rejected: [p('b'), p('cdax')],
          start: [p('a', struck('x'), 'b'), p('cd')],
        },
      ];

      for (const { accepted, end, rejected, start } of cases) {
        const editor = make(start, intent, [transfer()]);
        const result = editor.api.transfer.move({
          range: selectionOf([
            [[0, 0], 0],
            [[0, 1], end],
          ]),
          to: { point: { offset: 2, path: [1, 0] } },
        });
        const raw = expandedChildren(editor);

        assert.equal(result.status, 'moved');
        assert.deepEqual(unmarked(decided(raw, 'accept')), accepted);
        assert.deepEqual(
          decided(raw, 'reject', intent === 'edit' ? 'carol' : 'bob'),
          intent === 'edit' ? rejected : start
        );
      }
    });

    it(`admits a native letter only where the accepted document has the caret in ${mode}`, () => {
      const native = (start: Node[], at: At) => {
        const editor = make(start, intent);

        editor.update((tx) => tx.selection.set(selectionOf(at)));

        return probeCommandNativeEquivalent(editor, editorCommands.insertText, {
          text: 'Q',
        }).nativeEquivalent;
      };

      assert.equal(
        native([p('live'), struckBlock(p('gone'))], [[1, 0], 2]),
        false
      );
      assert.equal(
        native([p('live'), struckBlock(p('gone'))], [[0, 0], 4]),
        true
      );
      assert.equal(native([p('a', struck('xyz'), 'b')], [[0, 1], 1]), false);
    });
  }

  const typedAfter = (
    start: Node[],
    intent: Intent,
    at: At,
    run: Run | null
  ) => {
    const editor = make(start, intent);

    if (run) drive(editor, at, run, 'update');
    else editor.update((tx) => tx.selection.set(selectionOf(at)));
    const line = editor.read.selection()?.focus.path[0];

    typeZ(editor);

    return {
      caret: editor.read.selection()?.focus.path[0] === line,
      lines: (editor.read.children() as Node[]).map(textOf),
    };
  };

  for (const [name, start] of [
    ['', [p('ab'), p('cd')]],
    [' past a struck line', [p('ab'), struckBlock(p('gone')), p('cd')]],
  ] as const) {
    it(`J3 the letter typed after a Suggesting Backspace join${name} stays on the caret's line`, () => {
      assert.deepEqual(
        typedAfter(
          [...start],
          'propose',
          [[start.length - 1, 0], 0],
          backspace
        ),
        {
          caret: true,
          lines: start.length === 2 ? ['abZ', 'cd'] : ['abZ', 'gone', 'cd'],
        }
      );
    });
  }

  for (const [offset, lines] of [
    [0, ['First line', '', 'Second line', 'Last line']],
    [11, ['First line', 'Second line', '', 'Last line']],
  ] as const) {
    it(`Enter ${offset === 0 ? 'before' : 'after'} the letters of a line that are all struck keeps them on the caret's side`, () => {
      const editor = make(
        [p('First line'), p(struck('Second line')), p('Last line')],
        'propose'
      );

      drive(
        editor,
        [[1, 0], offset],
        (tx) => tx.command(editorCommands.insertBreak),
        'update'
      );

      assert.deepEqual(
        (editor.read.children() as Node[]).map((block) =>
          (block.children as Node[]).map((leaf) => leaf.text).join('')
        ),
        lines
      );
      assert.deepEqual(editor.read.selection(), selectionOf([[2, 0], 0]));
    });
  }

  // Rejecting Bob's split alone waits for Carol's join, as J1 says, so this
  // case checks only where the next letter lands.
  it("J5 a letter typed after a Suggesting Enter at the start of a line a pending join continues lands before the line's text", () => {
    const editor = make([p('a', struck('b')), joined(p('h'))], 'propose');

    drive(
      editor,
      [[0, 0], 0],
      (tx) => tx.command(editorCommands.insertBreak),
      'update'
    );
    typeZ(editor);

    assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
      p(''),
      p('Zah'),
    ]);
  });

  // The same wait holds here, so this case also checks only where the next
  // letter lands.
  it('a letter typed after a Suggesting Enter inside a struck line that a joined line follows lands on the new line', () => {
    const editor = make(
      [p('a', struck('b')), struckBlock(p('cd')), joined(p(struck('ef')))],
      'propose'
    );

    drive(
      editor,
      [[1, 0], 1],
      (tx) => tx.command(editorCommands.insertBreak),
      'update'
    );
    typeZ(editor);

    assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
      p('a'),
      p('Z'),
    ]);
  });

  for (const intent of ['edit', 'propose'] as const) {
    it(`arrow keys move through struck letters as through other text in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const editor = make([p('a', struck('xyz'), 'b')], intent);

      drive(
        editor,
        [[0, 0], 1],
        (tx) =>
          tx.command(editorCommands.move, {
            options: { distance: 2, unit: 'character' },
          }),
        'update'
      );

      assert.deepEqual(editor.read.selection()?.focus, {
        offset: 1,
        path: [0, 1],
      });
    });

    it(`J4 a letter typed at the end of a line another author's pending join follows stays there in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      assert.deepEqual(typedAfter(joinedLines(), intent, [[0, 0], 3], null), {
        caret: true,
        lines: ['helZ', 'lo world'],
      });
    });
  }

  for (const intent of ['edit', 'propose'] as const) {
    it(`Q3 a heading joined by a paragraph, then cleared, stays a heading in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const start = [h('hel'), p('lo')];
      const plain = make(start, 'plain');
      const editor = make(start, intent);
      const selectAll = (target: Editor): At => {
        const nodes = target.read.children() as Node[];
        const last = nodes.length - 1;

        return [
          [[0, 0], 0],
          [[last, 0], textOf(nodes[last]).length],
        ];
      };

      for (const target of [plain, editor]) {
        drive(target, [[1, 0], 0], backspace, 'update');
        drive(target, selectAll(target), fragment, 'update');
      }

      assert.deepEqual(plain.read.children(), [h('')]);
      assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
        h(''),
      ]);
    });
  }

  it('a command in a named root reads that root as the previous command left it while the main root holds suggestions', () => {
    const editor = make(
      { children: [p('a', struck('x'))], roots: { header: [p('ab')] } },
      'edit',
      [],
      HeaderBlocks
    );
    const header = createEditorView(editor, { root: 'header' });

    header.update((tx) => {
      tx.selection.set(selectionOf([[0, 0], 2]));
      type('X')(tx);
    });
    header.update((tx) => {
      tx.selection.set(selectionOf([[0, 0], 3]));
      type('Y')(tx);
    });

    assert.deepEqual(editor.read.root('header'), [p('abXY')]);
  });

  for (const [label, second] of [
    [
      'inserted',
      {
        ...p({ authored: [mark('insert')], text: 'b' }),
        authored: [mark('insert')],
      },
    ],
    ['struck', struckBlock(p('b'))],
  ] as const) {
    it(`a command beside an ${label} block decides on the root its minimum completes`, () => {
      const Pair = defineEditorSchema('command-pair', {
        ...blocks,
        id: 'command-pair',
        root: schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 2,
        }),
      });
      const plain = make(
        unmarked(
          decided([p('a'), second], 'accept', undefined, Pair)
        ) as Node[],
        'plain',
        [],
        Pair
      );
      const editor = make([p('a'), second], 'propose', [], Pair);

      for (const target of [plain, editor]) {
        drive(target, [[0, 0], 1], type('X'), 'update');
      }

      assert.deepEqual(
        unmarked(decided(editor.read.children(), 'accept', undefined, Pair)),
        unmarked(plain.read.children())
      );
    });
  }

  it('an Editing removal of a quote leaves the lines another author struck in it to that deletion', () => {
    const editor = make(
      [q({ ...p('x'), authored: [mark('delete')] }, p(struck('y'))), p('keep')],
      'edit'
    );

    editor.update.command(editorCommands.removeNodes, {
      options: { at: [0] },
    });

    assert.deepEqual(decided(editor.read.children(), 'reject', 'carol'), [
      q(p(''), p('y')),
      p('keep'),
    ]);
  });

  it('a command after a struck required heading decides on the root as a whole', () => {
    const Titled = defineEditorSchema('command-titled', {
      ...blocks,
      id: 'command-titled',
      root: schema.content.prefix(
        [{ element: 'heading' }],
        schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
        })
      ),
    });
    const start = [struckBlock(h('t')), p('b')];
    const accepted = unmarked(
      decided(start, 'accept', undefined, Titled)
    ) as Node[];
    const plain = make(accepted, 'plain', [], Titled);
    const editor = make(start, 'propose', [], Titled);

    drive(plain, [[accepted.length - 1, 0], 1], type('X'), 'update');
    drive(editor, [[1, 0], 1], type('X'), 'update');

    assert.deepEqual(
      unmarked(decided(editor.read.children(), 'accept', undefined, Titled)),
      unmarked(plain.read.children())
    );
  });

  for (const intent of ['edit', 'propose'] as const) {
    it(`a range delete across a struck paragraph that holds live text removes that text in ${intent}`, () => {
      const start = [
        p('ab'),
        { ...p(struck('ef'), 'gh'), authored: [mark('delete')] },
        p('ij'),
      ];
      const plain = make(unmarked(decided(start, 'accept')) as Node[], 'plain');
      const editor = make(start, intent);
      const range: At = [
        [[0, 0], 1],
        [[2, 0], 1],
      ];

      drive(plain, range, fragment, 'update');
      drive(editor, range, fragment, 'update');

      assert.deepEqual(
        unmarked(decided(editor.read.children(), 'accept')),
        unmarked(plain.read.children())
      );
    });

    it(`a change that replaces the range across a struck paragraph that holds live text removes that text in ${intent}`, () => {
      const start = [
        p('ab'),
        { ...p(struck('ef'), 'gh'), authored: [mark('delete')] },
        p('ij'),
      ];
      const editor = make(start, intent);
      const replaceAll = defineCommand('test.replaceAll', {
        build: ({ state }) =>
          state.transaction((tx) => {
            tx.changes.apply(
              DocumentChange.between({ children: state.children() }, {
                children: [p('aj')],
              } as never)
            );
          }),
      });

      editor.update.command(replaceAll);

      assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
        p('aj'),
      ]);
    });

    it(`removing a quote whose struck paragraph holds live text leaves no quote in ${intent}`, () => {
      const start = [q({ ...p('x'), authored: [mark('delete')] }), p('keep')];
      const plain = make(unmarked(decided(start, 'accept')) as Node[], 'plain');
      const editor = make(start, intent);

      for (const target of [plain, editor]) {
        target.update.command(editorCommands.removeNodes, {
          options: { at: [0] },
        });
      }

      assert.deepEqual(
        unmarked(decided(editor.read.children(), 'accept')),
        unmarked(plain.read.children())
      );
    });
  }

  it('Q4 a heading joined by a paragraph stays a heading once both halves are struck', () => {
    const editor = make([h('hel'), p('lo world')], 'propose');

    drive(editor, [[1, 0], 0], backspace, 'update');
    drive(
      editor,
      [
        [[0, 0], 0],
        [[0, 0], 3],
      ],
      fragment,
      'update'
    );
    drive(
      editor,
      [
        [[1, 0], 0],
        [[1, 0], 2],
      ],
      fragment,
      'update'
    );

    assert.deepEqual(unmarked(decided(editor.read.children(), 'accept')), [
      h(' world'),
    ]);
  });
});
