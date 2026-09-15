import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  NodeApi,
  property,
  schema,
  target,
} from 'platejs';

import { authored, readAuthoredFormatSnapshot } from '../authored';
import { migrateV54 } from './migratePlateV54';

const BoldPlugin = definePlugin('bold', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});
const RootPlugin = definePlugin('testRoot', {
  schema: ({ name, plugins }) => ({
    contentRoots: [
      {
        content: plugins.blockContent(),
        ownership: 'exclusive',
        slot: name,
        target: target.element(name),
      },
    ],
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  }),
});

const createMigrationEditor = () =>
  createEditor({
    plugins: [BaseParagraphPlugin, BoldPlugin, RootPlugin],
    skipInitialization: true,
  });

const reviewSnapshot = (document: ReturnType<typeof migrateV54>) => {
  const editor = createEditor({
    plugins: [
      BaseParagraphPlugin,
      BoldPlugin,
      RootPlugin,
      authored({ authorId: 'reader' }),
    ],
    initialValue: document,
  });

  return readAuthoredFormatSnapshot(editor);
};

describe('migratePlateV54 legacy suggestions', () => {
  it('preserves accepted and proposed text, properties, blocks, roots, and identities', () => {
    const editor = createMigrationEditor();
    const document = migrateV54({
      editor,
      from: 53,
      to: 54,
      document: {
        children: [
          {
            childRoots: { testRoot: 'notes' },
            children: [{ text: '' }],
            type: 'testRoot',
          },
          {
            children: [
              {
                suggestion: true,
                suggestion_replace: {
                  createdAt: 100,
                  id: 'replace',
                  type: 'remove',
                  userId: 'alice',
                },
                text: 'old ',
              },
              {
                suggestion: true,
                suggestion_replace: {
                  createdAt: 100,
                  id: 'replace',
                  type: 'insert',
                  userId: 'alice',
                },
                text: 'new ',
              },
              {
                bold: true,
                suggestion: true,
                suggestion_format: {
                  createdAt: 200,
                  id: 'format',
                  newProperties: { bold: true },
                  type: 'update',
                  userId: 'bob',
                },
                text: 'text',
              },
            ],
            type: 'p',
          },
          {
            children: [{ text: 'block' }],
            suggestion: {
              createdAt: 300,
              id: 'block',
              type: 'insert',
              userId: 'carol',
            },
            type: 'p',
          },
        ],
        meta: { application: 'fixture' },
        roots: {
          notes: [
            {
              children: [
                {
                  suggestion: true,
                  suggestion_root: {
                    createdAt: 400,
                    id: 'root',
                    type: 'remove',
                    userId: 'dana',
                  },
                  text: 'note',
                },
              ],
              type: 'p',
            },
          ],
        },
      },
    });
    const snapshot = reviewSnapshot(document);

    expect(snapshot.accepted.meta).toEqual({ application: 'fixture' });
    expect(snapshot.accepted.children).toHaveLength(2);
    expect(snapshot.accepted.children[1]?.type).toBe('paragraph');
    expect(NodeApi.string(snapshot.accepted.children[1])).toBe('old text');
    expect(snapshot.accepted.children[1]?.children).toEqual([
      { text: 'old text' },
    ]);
    expect(NodeApi.string(snapshot.accepted.roots!.notes[0])).toBe('note');

    expect(snapshot.proposed.children).toHaveLength(3);
    expect(NodeApi.string(snapshot.proposed.children[1])).toBe('new text');
    expect(snapshot.proposed.children[1]?.children.at(-1)).toEqual({
      bold: true,
      text: 'text',
    });
    expect(snapshot.proposed.children[2]?.type).toBe('paragraph');
    expect(NodeApi.string(snapshot.proposed.children[2])).toBe('block');
    expect(NodeApi.string(snapshot.proposed.roots!.notes[0])).toBe('');
    expect(
      snapshot.changes.map(({ authorId, createdAt, id }) => ({
        authorId,
        createdAt,
        id,
      }))
    ).toEqual([
      { authorId: 'alice', createdAt: 100, id: 'replace' },
      { authorId: 'bob', createdAt: 200, id: 'format' },
      { authorId: 'carol', createdAt: 300, id: 'block' },
      { authorId: 'dana', createdAt: 400, id: 'root' },
    ]);
    expect(JSON.stringify(document)).not.toContain('suggestion_');

    const reloaded = reviewSnapshot(JSON.parse(JSON.stringify(document)));

    expect(reloaded.accepted).toEqual(snapshot.accepted);
    expect(reloaded.proposed).toEqual(snapshot.proposed);
    expect(reloaded.changes).toEqual(snapshot.changes);
  });

  it.each([
    {
      accepted: ['onetwo'],
      proposed: ['one', 'two'],
      type: 'insert' as const,
    },
    {
      accepted: ['one', 'two'],
      proposed: ['onetwo'],
      type: 'remove' as const,
    },
  ])(
    'converts $type line-break suggestions',
    ({ accepted, proposed, type }) => {
      const document = migrateV54({
        editor: createMigrationEditor(),
        from: 53,
        to: 54,
        document: {
          children: [
            {
              children: [{ text: 'one' }],
              suggestion: {
                createdAt: 123,
                id: 'break',
                isLineBreak: true,
                type,
                userId: 'alice',
              },
              type: 'p',
            },
            { children: [{ text: 'two' }], type: 'p' },
          ],
        },
      });
      const snapshot = reviewSnapshot(document);

      expect(snapshot.accepted.children.map(NodeApi.string)).toEqual(accepted);
      expect(snapshot.proposed.children.map(NodeApi.string)).toEqual(proposed);
      expect(snapshot.changes).toMatchObject([
        { authorId: 'alice', createdAt: 123, id: 'break' },
      ]);
    }
  );

  it('rejects overlapping identities before producing native data', () => {
    expect(() =>
      migrateV54({
        editor: createMigrationEditor(),
        from: 53,
        to: 54,
        document: {
          children: [
            {
              children: [
                {
                  suggestion: true,
                  suggestion_one: {
                    createdAt: 1,
                    id: 'one',
                    type: 'insert',
                    userId: 'alice',
                  },
                  suggestion_two: {
                    createdAt: 2,
                    id: 'two',
                    type: 'insert',
                    userId: 'bob',
                  },
                  text: 'ambiguous',
                },
              ],
              type: 'p',
            },
          ],
        },
      })
    ).toThrow(
      /ambiguous overlapping suggestion identities at main\.0\.children\.0/
    );

    expect(() =>
      migrateV54({
        editor: createMigrationEditor(),
        from: 53,
        to: 54,
        document: {
          children: [
            {
              children: [
                {
                  suggestion: true,
                  suggestion_child: {
                    createdAt: 2,
                    id: 'child',
                    type: 'insert',
                    userId: 'bob',
                  },
                  text: 'nested',
                },
              ],
              suggestion: {
                createdAt: 1,
                id: 'parent',
                type: 'insert',
                userId: 'alice',
              },
              type: 'p',
            },
          ],
        },
      })
    ).toThrow(/"parent" contains another suggestion identity/);
  });

  it('rejects malformed and stale update metadata without changing the input', () => {
    const document = {
      children: [
        {
          children: [
            {
              suggestion: true,
              suggestion_format: {
                createdAt: 1,
                id: 'format',
                newProperties: { bold: true },
                type: 'update',
                userId: 'alice',
              },
              text: 'text',
            },
          ],
          type: 'p',
        },
      ],
    } as const;
    const frozen = JSON.stringify(document);

    expect(() =>
      migrateV54({
        document,
        editor: createMigrationEditor(),
        from: 53,
        to: 54,
      })
    ).toThrow(/current property "bold" does not match newProperties/);
    expect(JSON.stringify(document)).toBe(frozen);
  });
});
