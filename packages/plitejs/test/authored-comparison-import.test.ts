import { describe, expect, it } from 'bun:test';

import { createEditor } from 'plitejs';
import {
  authored,
  projectAuthoredDocument,
  proposeAuthoredComparison,
} from 'plitejs/authored';
import { compare, resolveComparison } from 'plitejs/diff';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('authored comparison import', () => {
  it('captures one comparison change as a native pending proposal', async () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before')],
    });
    const comparison = await compare({
      before: editor.read.value(),
      after: [paragraph('After')],
      schema: editor.read.schema,
    });
    const imported = proposeAuthoredComparison(editor, { comparison });

    expect(imported.status).toBe('applied');
    if (imported.status !== 'applied') return;
    expect(imported.mappings.map(({ groupId }) => groupId)).toEqual(
      comparison.changes.map(({ id }) => id)
    );
    expect(editor.read.authored.change(imported.ids[0])).not.toBeNull();
    expect(
      projectAuthoredDocument(editor.read.value(), { projection: 'accepted' })
        .document.children
    ).toEqual([paragraph('Before')]);
    expect(
      projectAuthoredDocument(editor.read.value(), { projection: 'proposed' })
        .document.children
    ).toEqual([paragraph('After')]);

    expect(proposeAuthoredComparison(editor, { comparison })).toEqual({
      ...imported,
      status: 'unchanged',
    });
    const reloaded = createEditor({
      plugins: [authored({ authorId: 'bob' })],
      initialValue: structuredClone(editor.read.value()),
    });
    expect(proposeAuthoredComparison(reloaded, { comparison }).status).toBe(
      'unchanged'
    );
    expect(
      reloaded.update.authored.decide({
        action: 'accept',
        changes: imported.ids.map((id) => reloaded.read.authored.change(id)!),
      }).status
    ).toBe('applied');
    expect(reloaded.read.children()).toEqual([paragraph('After')]);
  });

  it('rejects stale content and forged comparison ids', async () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before')],
    });
    const comparison = await compare({
      before: editor.read.value(),
      after: [paragraph('After')],
      schema: editor.read.schema,
    });
    expect(
      proposeAuthoredComparison(editor, {
        comparison: { ...comparison, id: 'forged' },
      })
    ).toEqual({ reason: 'comparison', status: 'invalid' });
    editor.update((tx) => {
      tx.text.insert(' local', { at: { offset: 6, path: [0, 0] } });
    });
    expect(proposeAuthoredComparison(editor, { comparison })).toEqual({
      reason: 'document',
      status: 'stale',
    });
  });

  it('imports a resolved three-way contribution against the live baseline', async () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const comparison = await compare({
      base: editor.read.value(),
      local: editor.read.value(),
      remote: [paragraph('Remote')],
      schema: editor.read.schema,
    });
    const resolution = await resolveComparison({
      baseline: 'base',
      comparison,
    });
    expect(resolution.status).toBe('resolved');
    if (resolution.status !== 'resolved') return;
    expect(
      proposeAuthoredComparison(editor, { comparison: resolution.comparison })
        .status
    ).toBe('applied');
    expect(
      projectAuthoredDocument(editor.read.value(), { projection: 'proposed' })
        .document.children
    ).toEqual([paragraph('Remote')]);
  });

  it('validates selected groups and atomically publishes a valid subset', async () => {
    const before = [paragraph('A'), paragraph('B'), paragraph('C')];
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: before,
    });
    const comparison = await compare({
      before: editor.read.value(),
      after: [
        paragraph('A'),
        paragraph('X'),
        paragraph('B'),
        paragraph('Y'),
        paragraph('C'),
      ],
      schema: editor.read.schema,
    });
    expect(comparison.changes.length).toBeGreaterThan(1);
    const first = comparison.changes[0].id;
    expect(
      proposeAuthoredComparison(editor, {
        comparison,
        groupIds: [first, first],
      })
    ).toEqual({ reason: 'selection', status: 'invalid' });
    expect(
      proposeAuthoredComparison(editor, {
        comparison,
        groupIds: ['missing'],
      })
    ).toEqual({ reason: 'selection', status: 'invalid' });
    const imported = proposeAuthoredComparison(editor, {
      comparison,
      groupIds: [first],
    });
    expect(imported.status).toBe('applied');
    const proposed = projectAuthoredDocument(editor.read.value(), {
      projection: 'proposed',
    }).document.children;
    expect(proposed).not.toEqual(before);
    expect(proposed).not.toEqual(comparison.after.document.children);
  });

  it('does not publish when the native actor is unavailable', async () => {
    const editor = createEditor({
      plugins: [authored({ authorId: () => null })],
      initialValue: [paragraph('Before')],
    });
    const comparison = await compare({
      before: editor.read.value(),
      after: [paragraph('After')],
      schema: editor.read.schema,
    });
    const before = structuredClone(editor.read.value());
    expect(proposeAuthoredComparison(editor, { comparison })).toEqual({
      reason: 'actor',
      status: 'unavailable',
    });
    expect(editor.read.value()).toEqual(before);
  });
});
