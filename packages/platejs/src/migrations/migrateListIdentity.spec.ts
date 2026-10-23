import { BaseParagraphPlugin, createEditor } from '../core';
import { BaseBlockquotePlugin } from '../features/basic-nodes/lib/BaseBlockPlugins';
import { BaseHeadingPlugin } from '../features/basic-nodes/lib/BaseHeadingPlugins';
import { BaseListPlugin } from '../features/list';
import {
  defineDocumentMigrations,
  migrateDocument,
} from './documentMigrations';
import { migrateListIdentity } from './migrateListIdentity';

type Block = Record<string, unknown> & {
  children: readonly Block[] | ReadonlyArray<{ text: string }>;
};

const plugins = [
  BaseParagraphPlugin,
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseListPlugin.configure({
    targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
  }),
];

const migrations = defineDocumentMigrations({
  plugins,
  schema: { id: 'list-identity', version: 2 },
  sourceFingerprints: { 1: 'before-list-identity' },
  steps: { 2: migrateListIdentity },
});

const migrate = (children: readonly Block[]) =>
  (
    migrateDocument({ children }, { migrations, source: 1 }).output as {
      document: { children: readonly Block[] };
    }
  ).document.children;

const isElement = (node: unknown): node is Block =>
  typeof node === 'object' && node !== null && 'children' in node;

const isListItem = (block: Block) =>
  block.listType === 'bulleted' ||
  block.listType === 'numbered' ||
  block.listType === 'task';

const indentOf = (block: Block) =>
  typeof block.indent === 'number' ? block.indent : 1;

const styleOf = (block: Block) =>
  (block.listType === 'numbered' && block.listStyle === 'decimal') ||
  (block.listType === 'bulleted' && block.listStyle === 'disc')
    ? undefined
    : block.listStyle;

// The numbering rule before list identity, written apart from the migration:
// an item continues the nearest earlier sibling at its indent, past deeper
// blocks, when that sibling is an item of the same kind, style and heading
// role; any other block at its indent or above starts a new list.
const adjacencyNumbers = (children: readonly Block[]) => {
  const numbers: Array<number | null> = [];
  const visit = (siblings: readonly Block[]) => {
    const ordinals: number[] = [];

    siblings.forEach((block, index) => {
      if (!isElement(block)) return;
      if (isListItem(block)) {
        let ordinal = typeof block.listStart === 'number' ? block.listStart : 1;

        for (let previous = index - 1; previous >= 0; previous -= 1) {
          const sibling = siblings[previous];

          if (!isElement(sibling) || indentOf(sibling) > indentOf(block)) {
            continue;
          }
          if (
            indentOf(sibling) === indentOf(block) &&
            isListItem(sibling) &&
            sibling.listType === block.listType &&
            styleOf(sibling) === styleOf(block) &&
            (sibling.type === 'heading') === (block.type === 'heading')
          ) {
            ordinal = ordinals[previous] + 1;
          }
          break;
        }
        if (typeof block.listRestart === 'number') ordinal = block.listRestart;
        ordinals[index] = ordinal;
        numbers.push(block.listType === 'numbered' ? ordinal : null);
      } else {
        numbers.push(null);
      }
      visit(block.children as readonly Block[]);
    });
  };

  visit(children);

  return numbers;
};

const identityNumbers = (children: readonly Block[]) => {
  const editor = createEditor({ initialValue: children, plugins } as never);
  const numbers: Array<number | null> = [];
  const visit = (siblings: readonly Block[], parentPath: number[]) => {
    siblings.forEach((block, index) => {
      if (!isElement(block)) return;

      const path = [...parentPath, index];

      numbers.push(
        block.listType === 'numbered'
          ? (editor.plugin(BaseListPlugin).read.ordinal(path) ?? null)
          : null
      );
      visit(block.children as readonly Block[], path);
    });
  };

  visit(editor.read.children() as readonly Block[], []);

  return numbers;
};

const text = (value: string) => [{ text: value }];
const item = (value: string, extra: Record<string, unknown> = {}): Block => ({
  children: text(value),
  indent: 1,
  listType: 'numbered',
  type: 'paragraph',
  ...extra,
});
const plain = (value: string, extra: Record<string, unknown> = {}): Block => ({
  children: text(value),
  type: 'paragraph',
  ...extra,
});
const quote = (...children: Block[]): Block => ({
  children,
  type: 'blockquote',
});

const fixtures: Record<string, Block[]> = {
  'a list broken by a paragraph': [
    item('A'),
    item('B'),
    plain('Note'),
    item('C'),
  ],
  'a deeper paragraph inside a list': [
    item('A'),
    plain('Detail', { indent: 2 }),
    item('B'),
  ],
  'nested runs under each parent': [
    item('P', { listType: 'bulleted' }),
    item('a', { indent: 2 }),
    item('b', { indent: 2 }),
    item('Q', { listType: 'bulleted' }),
    item('c', { indent: 2 }),
  ],
  'kind, style and heading changes': [
    item('One'),
    item('Bullet', { listType: 'bulleted' }),
    item('Two'),
    item('Alpha', { listStyle: 'lower-alpha' }),
    { ...item('Heading', { level: 1 }), type: 'heading' },
    item('Three', { listStyle: 'decimal' }),
  ],
  'starts and restarts': [
    item('Five', { listStart: 5 }),
    item('Six', { listStart: 2 }),
    item('Ten', { listRestart: 10 }),
    item('Eleven'),
    plain('Break'),
    item('Three', { listStart: 3 }),
  ],
  'lists inside containers': [
    item('A'),
    quote(item('B'), item('C')),
    item('D'),
    quote(item('E')),
  ],
  'a task and a bulleted run with starts': [
    item('Task', { checked: false, listStart: 4, listType: 'task' }),
    item('Bullet', { listRestart: 2, listType: 'bulleted' }),
    item('One'),
  ],
};

// A small seeded generator, so a failure names a document that reproduces.
const random = (seed: number) => {
  let state = seed;

  return (bound: number) => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

    return state % bound;
  };
};

const randomBlock = (next: (bound: number) => number, depth: number): Block => {
  const roll = next(20);

  if (roll < 3) {
    return plain('p', next(2) ? { indent: 1 + next(3) } : {});
  }
  if (roll < 5 && depth === 0) {
    return quote(
      ...Array.from({ length: 1 + next(4) }, () => randomBlock(next, 1))
    );
  }

  const listType = ['numbered', 'numbered', 'bulleted', 'task'][next(4)];
  const extra: Record<string, unknown> = {
    indent: 1 + next(3),
    listType,
  };

  if (listType === 'task') extra.checked = false;
  if (listType === 'numbered' && next(3) === 0) {
    extra.listStyle = next(2) ? 'lower-alpha' : 'decimal';
  }
  if (next(7) === 0) extra.listStart = 1 + next(9);
  if (next(10) === 0) extra.listRestart = 1 + next(9);

  return {
    ...item('i', extra),
    ...(next(12) === 0 ? { level: 1, type: 'heading' } : {}),
  };
};

describe('migrateListIdentity', () => {
  it.each(Object.entries(fixtures))(
    'keeps the numbers of %s',
    (_label, children) => {
      const migrated = migrate(children);

      expect(identityNumbers(migrated)).toEqual(adjacencyNumbers(children));
    }
  );

  it('keeps the numbers of 500 random documents', () => {
    const documents = Array.from({ length: 500 }, (_, index) => {
      const next = random(index + 1);

      return Array.from({ length: 1 + next(30) }, () => randomBlock(next, 0));
    });
    // Each migrated document's lists carry fresh ids, so one editor over all
    // of them numbers each document as an editor of its own would, without
    // paying an editor's setup per document.
    const numbers = identityNumbers(
      documents.flatMap((children) => migrate(children))
    );
    let offset = 0;

    documents.forEach((children, index) => {
      const expected = adjacencyNumbers(children);
      const actual = numbers.slice(offset, offset + expected.length);

      offset += expected.length;
      expect({ numbers: actual, seed: index + 1 }).toEqual({
        numbers: expected,
        seed: index + 1,
      });
    });
    expect(offset).toBe(numbers.length);
  });

  it('changes nothing on a second run', () => {
    const once = migrate(Object.values(fixtures).flat());

    expect(migrate(once)).toEqual(once);
  });

  it('gives a run the one id its items already hold', () => {
    const migrated = migrate([
      item('A'),
      item('B', { listId: 'kept' }),
      item('C'),
      plain('Break'),
      item('D'),
      item('E', { listId: 'first' }),
      item('F'),
      item('G', { listId: 'second' }),
      item('H'),
    ]);
    const ids = migrated.map((block) => block.listId ?? null);

    expect(ids.slice(0, 4)).toEqual(['kept', 'kept', 'kept', null]);
    expect(ids.slice(5)).toEqual(['first', 'first', 'second', 'second']);
    expect(ids[4]).toBe('first');
  });

  it('gives separate runs separate fresh ids', () => {
    const migrated = migrate([item('A'), plain('Break'), item('B')]);

    expect(typeof migrated[0].listId).toBe('string');
    expect(migrated[2].listId).not.toBe(migrated[0].listId);
  });
});
