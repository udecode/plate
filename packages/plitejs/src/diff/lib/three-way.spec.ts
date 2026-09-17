import { describe, expect, it } from 'vitest';

import { createEditor, defineEditorSchema, schema } from '../..';
import { compare, resolveComparison } from './compare';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const schemaFor = (value: Array<ReturnType<typeof paragraph>>) =>
  createEditor({ initialValue: value }).read.schema;

const GridSchema = defineEditorSchema('three-way-grid', {
  elements: {
    cell: {
      content: schema.content.text(),
      structure: { kind: 'grid', role: 'cell' },
    },
    row: {
      content: schema.content.type('cell', { min: 1 }),
      structure: { kind: 'grid', role: 'row' },
    },
    table: {
      content: schema.content.type('row', { min: 1 }),
      structure: { kind: 'grid', role: 'grid' },
    },
  },
  root: schema.content.type('table', { min: 1 }),
  unknown: 'reject',
});

const table = (text: string) => [
  {
    children: [
      { children: [{ children: [{ text }], type: 'cell' }], type: 'row' },
    ],
    type: 'table',
  },
];

describe('three-way structural comparison', () => {
  it('merges disjoint branch contributions without a conflict', async () => {
    const base = [paragraph('one'), paragraph('two')];
    const local = [paragraph('one local'), paragraph('two')];
    const remote = [paragraph('one'), paragraph('two remote')];
    const comparison = await compare({
      base,
      local,
      remote,
      schema: schemaFor(base),
    });

    expect(comparison.kind).toBe('three-way');
    expect(comparison.conflicts).toEqual([]);
    expect(comparison.changes.map(({ branches }) => branches)).toEqual(
      expect.arrayContaining([['local'], ['remote']])
    );

    const result = await resolveComparison({
      baseline: 'base',
      comparison,
    });

    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;
    expect(result.comparison.after.document.children).toEqual([
      paragraph('one local'),
      paragraph('two remote'),
    ]);
    expect(
      result.comparison.change.apply(result.comparison.before.document)
    ).toEqual(result.comparison.after.document);
    expect(result.comparison.changes.every(({ branches }) => branches)).toBe(
      true
    );
  });

  it('deduplicates identical branch contributions as shared evidence', async () => {
    const base = [paragraph('base')];
    const next = [paragraph('shared')];
    const comparison = await compare({
      base,
      local: next,
      remote: next,
      schema: schemaFor(base),
    });

    expect(comparison.conflicts).toEqual([]);
    expect(comparison.changes).toHaveLength(1);
    expect(comparison.changes[0]?.branches).toEqual(['local', 'remote']);

    const result = await resolveComparison({
      baseline: 'base',
      comparison,
    });

    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;
    expect(result.comparison.after.document.children).toEqual(next);
  });

  it('publishes explicit conflicts and applies either revision-bound choice', async () => {
    const base = [paragraph('base')];
    const local = [paragraph('local')];
    const remote = [paragraph('remote')];
    const comparison = await compare({
      base,
      local,
      remote,
      schema: schemaFor(base),
    });

    expect(comparison.conflicts).toHaveLength(1);
    const conflict = comparison.conflicts[0];
    expect(conflict.local.changeIds).not.toEqual([]);
    expect(conflict.remote.changeIds).not.toEqual([]);

    const pending = await resolveComparison({
      baseline: 'base',
      comparison,
    });
    expect(pending).toEqual({
      conflicts: comparison.conflicts,
      status: 'unresolved',
    });

    const chooseLocal = await resolveComparison({
      baseline: 'base',
      comparison,
      resolutions: [
        {
          choice: 'local',
          comparisonId: comparison.id,
          conflictId: conflict.id,
        },
      ],
    });
    const chooseRemote = await resolveComparison({
      baseline: 'base',
      comparison,
      resolutions: [
        {
          choice: 'remote',
          comparisonId: comparison.id,
          conflictId: conflict.id,
        },
      ],
    });

    expect(chooseLocal.status).toBe('resolved');
    expect(chooseRemote.status).toBe('resolved');
    if (
      chooseLocal.status !== 'resolved' ||
      chooseRemote.status !== 'resolved'
    ) {
      return;
    }
    expect(chooseLocal.comparison.after.document.children).toEqual(local);
    expect(chooseRemote.comparison.after.document.children).toEqual(remote);
  });

  it('rejects stale identities, duplicate choices and invalid custom documents', async () => {
    const base = [paragraph('base')];
    const comparison = await compare({
      base,
      local: [paragraph('local')],
      remote: [paragraph('remote')],
      schema: schemaFor(base),
    });
    const conflict = comparison.conflicts[0];

    await expect(
      resolveComparison({
        baseline: 'base',
        comparison,
        resolutions: [
          {
            choice: 'local',
            comparisonId: `${comparison.id}:stale`,
            conflictId: conflict.id,
          },
        ],
      })
    ).resolves.toMatchObject({ status: 'invalid' });

    await expect(
      resolveComparison({
        baseline: 'base',
        comparison,
        resolutions: [
          {
            choice: {
              document: { children: [{ text: 'invalid' }] },
              kind: 'custom',
            },
            comparisonId: comparison.id,
            conflictId: conflict.id,
          },
        ],
      })
    ).resolves.toMatchObject({ status: 'invalid' });
  });

  it('keeps comparison and resolution deterministic under repeated execution', async () => {
    const base = [paragraph('a'), paragraph('b')];
    const input = {
      base,
      local: [paragraph('local'), paragraph('b')],
      remote: [paragraph('a'), paragraph('remote')],
      schema: schemaFor(base),
    };
    const first = await compare(input);
    const second = await compare(input);

    expect(second).toEqual(first);
    const [firstResolved, secondResolved] = await Promise.all([
      resolveComparison({ baseline: 'local', comparison: first }),
      resolveComparison({ baseline: 'local', comparison: second }),
    ]);

    expect(secondResolved).toEqual(firstResolved);
  });

  it('requires a choice for concurrent move-delete and divergent moves', async () => {
    const base = [paragraph('A'), paragraph('B'), paragraph('C')];
    const comparisonSchema = schemaFor(base);
    const moveDelete = await compare({
      base,
      local: [paragraph('B'), paragraph('C'), paragraph('A')],
      remote: [paragraph('B'), paragraph('C')],
      schema: comparisonSchema,
    });
    const moveBase = [
      paragraph('A'),
      paragraph('B'),
      paragraph('C'),
      paragraph('D'),
    ];
    const divergentMoves = await compare({
      base: moveBase,
      local: [paragraph('B'), paragraph('C'), paragraph('A'), paragraph('D')],
      remote: [paragraph('B'), paragraph('C'), paragraph('D'), paragraph('A')],
      schema: schemaFor(moveBase),
    });

    expect(moveDelete.conflicts.length).toBeGreaterThan(0);
    expect(divergentMoves.conflicts.length).toBeGreaterThan(0);
    await expect(
      resolveComparison({ baseline: 'base', comparison: moveDelete })
    ).resolves.toMatchObject({ status: 'unresolved' });
  });

  it('preserves branch policy when local and remote are permuted', async () => {
    const base = [paragraph('base')];
    const comparisonSchema = schemaFor(base);
    const local = [paragraph('local')];
    const remote = [paragraph('remote')];
    const forward = await compare({
      base,
      local,
      remote,
      schema: comparisonSchema,
    });
    const reversed = await compare({
      base,
      local: remote,
      remote: local,
      schema: comparisonSchema,
    });
    const resolveLocal = async (
      comparison: typeof forward,
      choice: 'local' | 'remote'
    ) =>
      resolveComparison({
        baseline: 'base',
        comparison,
        resolutions: comparison.conflicts.map(({ id }) => ({
          choice,
          comparisonId: comparison.id,
          conflictId: id,
        })),
      });
    const [forwardLocal, reversedRemote] = await Promise.all([
      resolveLocal(forward, 'local'),
      resolveLocal(reversed, 'remote'),
    ]);

    expect(forwardLocal.status).toBe('resolved');
    expect(reversedRemote.status).toBe('resolved');
    if (
      forwardLocal.status !== 'resolved' ||
      reversedRemote.status !== 'resolved'
    ) {
      return;
    }
    expect(forwardLocal.comparison.after.document).toEqual(
      reversedRemote.comparison.after.document
    );
  });

  it('rejects cancelled comparison and resolution work with AbortError', async () => {
    const base = [paragraph('base')];
    const comparisonSchema = schemaFor(base);
    const controller = new AbortController();

    controller.abort();
    await expect(
      compare({
        base,
        local: [paragraph('local')],
        remote: [paragraph('remote')],
        schema: comparisonSchema,
        signal: controller.signal,
      })
    ).rejects.toMatchObject({ name: 'AbortError' });

    const comparison = await compare({
      base,
      local: [paragraph('local')],
      remote: [paragraph('remote')],
      schema: comparisonSchema,
    });
    await expect(
      resolveComparison({
        baseline: 'base',
        comparison,
        signal: controller.signal,
      })
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('classifies incompatible logical-grid contributions as a grid conflict', async () => {
    const editor = createEditor({
      plugins: [GridSchema],
      initialValue: table('base'),
    });
    const comparison = await compare({
      base: table('base'),
      local: table('local'),
      remote: table('remote'),
      schema: editor.read.schema,
    });

    expect(comparison.conflicts).toHaveLength(1);
    expect(comparison.conflicts[0]?.kind).toBe('grid');
  });
});
