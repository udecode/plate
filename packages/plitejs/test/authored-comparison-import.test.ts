import { describe, expect, it } from 'bun:test';

import { createEditor } from 'plitejs';
import {
  authored,
  proposeAuthoredComparison,
  serializeAuthoredJson,
} from 'plitejs/authored';
import { compare, resolveComparison } from 'plitejs/diff';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('authored comparison import', () => {
  it('captures one comparison change as a native pending proposal', async () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
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
    expect(editor.read.authored.change(imported.ids[0])?.status).toBe(
      'pending'
    );
    expect(editor.read.children()).toEqual([paragraph('Before')]);
    expect(
      JSON.parse(serializeAuthoredJson(editor, { projection: 'proposed' }).data)
        .children
    ).toEqual([paragraph('After')]);

    expect(proposeAuthoredComparison(editor, { comparison })).toEqual({
      ...imported,
      status: 'unchanged',
    });
    const reloaded = createEditor({
      plugins: [authored({ authorId: 'bob', retainHistory: true })],
      initialValue: structuredClone(editor.read.value()),
    });
    expect(proposeAuthoredComparison(reloaded, { comparison }).status).toBe(
      'unchanged'
    );
    expect(
      reloaded.update.authored.decide({
        action: 'accept',
        selection: reloaded.read.authored.select({ ids: imported.ids }),
      }).status
    ).toBe('applied');
    expect(reloaded.read.children()).toEqual([paragraph('After')]);
  });

  it('rejects stale content, stale authored metadata, and forged comparison ids', async () => {
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

    const frontier = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Before')],
    });
    const frontierComparison = await compare({
      before: frontier.read.value(),
      after: [paragraph('After')],
      schema: frontier.read.schema,
    });
    frontier.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' draft', { at: { offset: 6, path: [0, 0] } });
    });
    expect(
      proposeAuthoredComparison(frontier, { comparison: frontierComparison })
    ).toEqual({ reason: 'authored-frontier', status: 'stale' });
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
      JSON.parse(serializeAuthoredJson(editor, { projection: 'proposed' }).data)
        .children
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
    const proposed = JSON.parse(
      serializeAuthoredJson(editor, { projection: 'proposed' }).data
    ).children;
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
