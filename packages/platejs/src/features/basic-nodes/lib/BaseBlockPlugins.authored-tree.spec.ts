import { editorCommands, type EditorUpdateTransaction } from 'plitejs';
import { createAuthoredPlugin } from 'plitejs/authored';

import { createDataTransfer } from '#platejs-test-internal';

import { authoredTestApi } from '../../../authored/__tests__/authoredTestApi';
import { BaseParagraphPlugin, createEditor } from '../../../core';
import {
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
} from './BaseBlockPlugins';
import { BaseHeadingPlugin, HeadingRules } from './BaseHeadingPlugins';
import { BaseBoldPlugin, BoldRules } from './BaseMarkPlugins';

// Plate's block rules decide on the document with every pending change
// accepted, so accepting everything after a key gives what plain Plate gives
// on the accepted start, and rejecting gives back what was there.

type Intent = 'edit' | 'propose';
type Node = Record<string, unknown>;
type At = [number[], number] | [[number[], number], [number[], number]];

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
const h = (value: string): Node => ({
  children: [{ text: value }],
  level: 1,
  type: 'heading',
});
const bq = (...children: Node[]): Node => ({ children, type: 'blockquote' });
const hr = (): Node => ({ children: [{ text: '' }], type: 'horizontalRule' });
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
const joined = (block: Node): Node => ({ ...block, authored: [mark('join')] });
const insertedBlock = (block: Node): Node => ({
  ...block,
  authored: [mark('insert')],
  children: (block.children as Node[]).map((child) => ({
    ...child,
    authored: [mark('insert')],
  })),
});
const bolded = (value: string): Node => ({
  authored: [{ ...mark('format'), id: 'carol-tag:1', key: 'bold' }],
  bold: true,
  text: value,
});

const kit = [
  BaseParagraphPlugin,
  BaseHeadingPlugin.configure({ inputRules: [HeadingRules.markdown()] }),
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseBoldPlugin.configure({ inputRules: [BoldRules.markdown()] }),
] as const;
const proofOf = (intent: Intent) => {
  let count = 0;
  let clock = 1;

  return createAuthoredPlugin({
    authorId: 'bob',
    createChangeId: () => `bob:${(count += 1)}`,
    intent,
    now: () => (clock += 1),
  });
};
const make = (value: readonly unknown[], intent: Intent | 'plain') =>
  createEditor({
    initialValue: value as never,
    plugins: intent === 'plain' ? [...kit] : [...kit, proofOf(intent)],
  });
type Editor = ReturnType<typeof make>;
type Saved = readonly unknown[] | ReturnType<Editor['read']['value']>;

const childrenOf = (value: Saved) =>
  'children' in value ? value.children : value;
const isEditingWrite = (change: string) => change.startsWith('~edit:');
const changesOf = (value: Saved, author?: string) => {
  const changes = new Set<string>();
  const visit = (node: Node) => {
    for (const { change } of (node.authored ?? []) as Array<{
      change?: string;
    }>) {
      if (change) changes.add(change);
    }
    (node.children as Node[] | undefined)?.forEach(visit);
  };

  (childrenOf(value) as Node[]).forEach(visit);

  return [...changes].filter(
    (c) => !isEditingWrite(c) && (!author || c.startsWith(`${author}:`))
  );
};
const decided = (
  value: Saved,
  action: 'accept' | 'reject',
  author?: string
) => {
  const proof = proofOf('edit');
  const editor = createEditor({
    initialValue: value as never,
    plugins: [...kit, proof],
  });
  const changes = changesOf(value, author);

  if (changes.length > 0) {
    authoredTestApi(editor).decide({ action, changes });
  }

  return editor.read.children();
};
const unmarked = (value: readonly unknown[]): unknown =>
  JSON.parse(
    JSON.stringify(value, (key, field) =>
      key === 'authored' ? undefined : field
    )
  );
const pending = (value: readonly unknown[]): unknown =>
  JSON.parse(
    JSON.stringify(value, (key, field) => {
      if (key !== 'authored') return field;

      const claims = (field as Array<{ kind: string }>).filter(
        (member) => member.kind !== 'held'
      );

      return claims.length > 0 ? claims : undefined;
    })
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

type Side = 'plain' | 'review';
type Run = (editor: Editor, side: Side) => void;
type Case = Readonly<{
  accepted: Node[];
  at: At;
  name: string;
  plainAt: At;
  run: Run;
  start: Node[];
}>;

const command =
  (run: (tx: EditorUpdateTransaction) => void): Run =>
  (editor) =>
    editor.update(run);
const backspace = command((tx) =>
  tx.command(editorCommands.delete, {
    direction: 'backward',
    unit: 'character',
  })
);
const enter = command((tx) => tx.command(editorCommands.insertBreak));
const type = (value: string) =>
  command((tx) => tx.command(editorCommands.insertText, { text: value }));
const deleteSelection = command((tx) =>
  tx.command(editorCommands.deleteFragment, { direction: 'backward' })
);
const paste =
  (mimeType: string, value: string): Run =>
  (editor) => {
    const inserted = editor.api.dom.clipboard.insertData(
      createDataTransfer(new Map([[mimeType, value]]))
    );

    if (!inserted) throw new Error('paste inserted nothing');
  };

const drive = (editor: Editor, at: At, run: Run, side: Side) => {
  editor.update((tx) => tx.selection.set(selectionOf(at)));
  run(editor, side);
};

const law = (c: Case) => {
  for (const intent of ['edit', 'propose'] as const) {
    it(`${c.name} in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const plain = make(decided(c.start, 'accept'), 'plain');

      drive(plain, c.plainAt, c.run, 'plain');
      expect(unmarked(plain.read.children())).toEqual(c.accepted);

      const editor = make(c.start, intent);

      drive(editor, c.at, c.run, 'review');
      const raw = editor.read.value();

      expect(unmarked(decided(raw, 'accept'))).toEqual(c.accepted);
      expect(joinCount(childrenOf(raw))).toBeLessThanOrEqual(1);
      if (intent === 'propose') {
        expect(pending(decided(raw, 'reject'))).toEqual(
          pending(decided(c.start, 'reject'))
        );
        expect(pending(decided(raw, 'reject', 'bob'))).toEqual(c.start);
        expect(changesOf(raw, 'bob').length).toBeLessThanOrEqual(1);
      } else {
        const restored = textOf({
          children: decided(raw, 'reject', 'carol'),
        });

        for (const value of carolStruck(c.start)) {
          expect(restored).toContain(value);
        }
      }

      type('Z')(plain, 'plain');
      type('Z')(editor, 'review');
      expect(unmarked(decided(editor.read.value(), 'accept'))).toEqual(
        unmarked(plain.read.children())
      );
    });
  }
};

describe('Plate block rules beside pending suggestions', () => {
  law({
    accepted: [h('helo world')],
    at: [[1, 0], 0],
    name: 'P1 Backspace at a heading another author joined',
    plainAt: [[0, 0], 3],
    run: backspace,
    start: [h('hel'), joined(h('lo world'))],
  });
  law({
    accepted: [p('x'), p('live')],
    at: [[1, 1, 0], 0],
    name: 'P2 Backspace lifts a quote line past a struck line',
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), bq(struckBlock(p('gone')), p('live'))],
  });
  law({
    accepted: [p('x'), hr(), p('live')],
    at: [[3, 0], 0],
    name: 'P3 Backspace after a divider and a struck line',
    plainAt: [[2, 0], 0],
    run: backspace,
    start: [p('x'), hr(), struckBlock(p('gone')), p('live')],
  });
  law({
    accepted: [p('body')],
    at: [[1, 0], 0],
    name: 'P4 Backspace into a heading whose text is struck',
    plainAt: [[1, 0], 0],
    run: backspace,
    start: [{ ...h('Title'), children: [struck('Title')] }, p('body')],
  });
  for (const [label, run, accepted] of [
    ['Backspace', deleteSelection, [p('')]],
    ['a typed letter', type('Q'), [p('Q')]],
    ['Enter', enter, [p(''), p('')]],
  ] as const) {
    law({
      accepted: accepted as unknown as Node[],
      at: [
        [[0, 0], 0],
        [[2, 0], 1],
      ],
      name: `P5 select all, then ${label}`,
      plainAt: [
        [[0, 0], 0],
        [[1, 0], 1],
      ],
      run,
      start: [p('a'), struckBlock(p('gone')), p('b')],
    });
  }
  law({
    accepted: [p('x'), p('ad')],
    at: [[1, 0, 0], 0],
    name: 'S1 Backspace lifts a quote line holding struck letters',
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), bq(p('a', struck('bc'), 'd'))],
  });
  law({
    accepted: [p('x'), p('live')],
    at: [[1, 0, 0], 0],
    name: 'P2 Backspace lifts a quote line another author inserted',
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), bq(insertedBlock(p('live')))],
  });
  law({
    accepted: [p('x'), p('a', { bold: true, text: 'bc' }, 'd')],
    at: [[1, 0, 0], 0],
    name: 'S1 Backspace lifts a quote line holding letters another author bolded',
    plainAt: [[1, 0, 0], 0],
    run: backspace,
    start: [p('x'), bq(p('a', bolded('bc'), 'd'))],
  });
  law({
    accepted: [p('x'), h('')],
    at: [[1, 0], 11],
    name: 'the heading input rule converts a line whose text is struck',
    plainAt: [[1, 0], 0],
    run: (editor) => {
      editor.update.text.insert('#');
      editor.update.text.insert(' ');
    },
    start: [p('x'), p(struck('Second line'))],
  });
  law({
    accepted: [p({ bold: true, text: 'bold' })],
    at: [[0, 2], 3],
    name: 'the bold input rule closes across struck letters',
    plainAt: [[0, 0], 7],
    run: (editor) => editor.update.text.insert('*'),
    start: [p('**bo', struck('XX'), 'ld*')],
  });
  law({
    accepted: [h('Titlebody')],
    at: [[2, 0], 0],
    name: 'S4 Backspace merges into a heading past a struck line',
    plainAt: [[1, 0], 0],
    run: backspace,
    start: [h('Title'), struckBlock(p('gone')), p('body')],
  });
  law({
    accepted: [p('x'), bq(p('Q'))],
    at: [[1, 0, 0], 2],
    name: 'S6 typing in a quote whose only line is struck',
    plainAt: [[1, 0, 0], 0],
    run: type('Q'),
    start: [p('x'), bq(struckBlock(p('gone')))],
  });
  law({
    accepted: [p('a'), hr(), p('Qb')],
    at: [[2, 0], 2],
    name: 'Sol6 typing in a struck line after a divider',
    plainAt: [[2, 0], 0],
    run: type('Q'),
    start: [p('a'), hr(), struckBlock(p('gone')), p('b')],
  });
  law({
    accepted: [h(' world')],
    at: [
      [[0, 0], 0],
      [[1, 0], 2],
    ],
    name: 'T7b deleting across two headings another author joined',
    plainAt: [
      [[0, 0], 0],
      [[0, 0], 5],
    ],
    run: deleteSelection,
    start: [h('hel'), joined(h('lo world'))],
  });
  law({
    accepted: [p('ab')],
    at: [[0, 1, 0], 1],
    name: 'U1 untab over a pending join',
    plainAt: [[0, 0, 0], 2],
    run: (editor) => editor.update.blockquote.untab(),
    start: [bq(p('a'), joined(p('b')))],
  });
  law({
    accepted: [bq(p('body')), p('tail')],
    at: [[1, 0], 0],
    name: 'W1 wraps the line a caller names past a struck line',
    plainAt: [[0, 0], 0],
    run: (editor, side) =>
      editor.update.blockquote.wrap({ at: side === 'plain' ? [0] : [1] }),
    start: [struckBlock(p('gone')), p('body'), p('tail')],
  });
  law({
    accepted: [p('liveQ')],
    at: [[1, 0], 2],
    name: 'V1 pasting text into a struck line',
    plainAt: [[0, 0], 4],
    run: paste('text/plain', 'Q'),
    start: [p('live'), struckBlock(p('gone'))],
  });
  law({
    accepted: [p('Q')],
    at: [
      [[0, 0], 0],
      [[2, 0], 1],
    ],
    name: 'V2 pasting over select all',
    plainAt: [
      [[0, 0], 0],
      [[1, 0], 1],
    ],
    run: paste('text/plain', 'Q'),
    start: [p('a'), struckBlock(p('gone')), p('b')],
  });
  law({
    accepted: [p('aone'), p('twob')],
    at: [[0, 1], 1],
    name: 'V3 pasting paragraphs inside struck letters',
    plainAt: [[0, 0], 1],
    run: paste('text/html', '<p>one</p><p>two</p>'),
    start: [p('a', struck('xyz'), 'b')],
  });
});

describe('Plate merges beside a pending join', () => {
  for (const intent of ['edit', 'propose'] as const) {
    it(`keeps a delete into a line another author joined off the line before the emptied line in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
      const editor = make([p('xZ'), p('ab'), joined(p('cd'))], intent);

      editor.update((tx) =>
        tx.text.delete({
          at: {
            anchor: { offset: 0, path: [1, 0] },
            focus: { offset: 1, path: [2, 0] },
          },
        })
      );

      expect(unmarked(decided(editor.read.value(), 'accept'))).toEqual([
        p('xZ'),
        p('d'),
      ]);
    });
  }
});
