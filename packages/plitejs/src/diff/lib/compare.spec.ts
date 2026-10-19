import { describe, expect, it } from 'vitest';

import { createEditor } from '../..';
import { compare } from './compare';

const paragraph = (text: string, properties = {}) => ({
  ...properties,
  type: 'paragraph',
  children: [{ text }],
});

describe('compare', () => {
  it('returns a detached deterministic comparison with an exact inverse', async () => {
    const editor = createEditor({ initialValue: [paragraph('before')] });
    const before = [paragraph('before')];
    const after = [paragraph('after', { align: 'center' })];
    const pendingFirst = compare({ after, before, schema: editor.read.schema });

    after[0].children[0].text = 'mutated';
    const first = await pendingFirst;
    after[0].children[0].text = 'after';
    const second = await compare({ after, before, schema: editor.read.schema });

    expect(first.id).toBe(second.id);
    expect(first.kind).toBe('two-way');
    expect(first.change.apply(first.before.document)).toEqual(
      first.after.document
    );
    expect(
      first.change.invert(first.before.document).apply(first.after.document)
    ).toEqual(first.before.document);
    expect(
      first.changes.flatMap((change) => change.effects).map(({ kind }) => kind)
    ).toEqual(expect.arrayContaining(['property', 'text']));

    expect(first.after.document.children).toEqual([
      paragraph('after', { align: 'center' }),
    ]);
    expect(Object.isFrozen(first.after.document.children)).toBe(true);
  });

  it('validates unknown input through the supplied schema', async () => {
    const editor = createEditor({ initialValue: [paragraph('valid')] });
    const invalid = [{ type: 'paragraph', children: 'invalid' }];

    await expect(
      compare({
        after: invalid,
        before: editor.read.value(),
        schema: editor.read.schema,
      })
    ).rejects.toThrow();
    expect(invalid).toEqual([{ type: 'paragraph', children: 'invalid' }]);
  });

  it('reports named-root lifecycle and preserves exact root content', async () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { note: [paragraph('note')] },
      },
    });
    const before = { children: [paragraph('main')] };
    const after = {
      children: [paragraph('main')],
      roots: { note: [paragraph('note')] },
    };
    const result = await compare({ after, before, schema: editor.read.schema });

    expect(result.change.apply(result.before.document)).toEqual(after);
    expect(
      result.changes.flatMap((change) => change.effects).map(({ kind }) => kind)
    ).toContain('root-create');
  });

  it('distinguishes insertion path shifts from a reordered unique node', async () => {
    const editor = createEditor({
      initialValue: [paragraph('A'), paragraph('B'), paragraph('C')],
    });
    const inserted = await compare({
      after: [paragraph('new'), paragraph('A'), paragraph('B'), paragraph('C')],
      before: [paragraph('A'), paragraph('B'), paragraph('C')],
      schema: editor.read.schema,
    });
    const reordered = await compare({
      after: [paragraph('B'), paragraph('A'), paragraph('C')],
      before: [paragraph('A'), paragraph('B'), paragraph('C')],
      schema: editor.read.schema,
    });

    expect(
      inserted.changes
        .flatMap((change) => change.effects)
        .some(({ kind }) => kind === 'placement')
    ).toBe(false);
    expect(
      reordered.changes
        .flatMap((change) => change.effects)
        .some(({ kind }) => kind === 'placement')
    ).toBe(true);
  });

  it('rejects cancellation without returning a partial result', async () => {
    const editor = createEditor({ initialValue: [paragraph('before')] });
    const controller = new AbortController();
    controller.abort();

    await expect(
      compare({
        after: [paragraph('after')],
        before: editor.read.value(),
        schema: editor.read.schema,
        signal: controller.signal,
      })
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
