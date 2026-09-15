import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history, History } from 'plitejs/history';

import { readRecord, records, writeRecord } from '../src/authored/record-tree';
import {
  authoredState,
  compactAuthoredContent,
  hasAuthoredContent,
  reduceAuthoredOperation,
  type AuthoredEdit,
} from '../src/authored/state';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const marker = 'closed-body-retention-marker-';
const payload = marker.repeat(1024);
const proposal = { intent: 'propose', projection: 'proposed' } as const;

describe('native authored payload retention', () => {
  for (const localHistory of [false, true]) {
    for (const action of ['accepted-delete', 'rejected-insert'] as const) {
      it(`omits ${action} content from the default canonical save${localHistory ? ' while local History owns undo' : ''}`, () => {
        const editor = createEditor({
          plugins: [
            authored({ authorId: 'alice' }),
            ...(localHistory ? [history()] : []),
          ],
          initialValue: [
            paragraph(action === 'accepted-delete' ? payload : ''),
          ],
        });
        const proposed = createEditorView(editor, { authored: proposal });
        if (action === 'accepted-delete') {
          editor.update.text.delete({
            at: { anchor: point(0), focus: point(payload.length) },
          });
        } else {
          proposed.update.text.insert(payload, { at: point(0) });
          assert.equal(
            editor.update.authored.decide({
              action: 'reject',
              selection: editor.read.authored.select({ status: 'pending' }),
            }).status,
            'applied'
          );
        }
        const selection = editor.read.authored.select({});
        assert.equal(selection.changes.length, 1);
        assert.deepEqual(editor.read.children(), [paragraph('')]);
        assert.equal(
          editor.read.authored.changes({ status: 'pending' }).items.length,
          0
        );
        const saved = JSON.stringify(editor.read.value());
        assert.equal(saved.includes(marker), false);
        const restored = createEditor({
          plugins: [
            authored({ authorId: 'alice', retainHistory: true }),
            history(),
          ],
          initialValue: JSON.parse(saved),
        });
        assert.deepEqual(restored.read.children(), [paragraph('')]);
        assert.deepEqual(restored.read.authored.select({}), selection);
        const before = JSON.stringify(restored.read.value());
        assert.deepEqual(restored.update.authored.revert({ selection }), {
          status: 'unavailable',
          reason: 'retention',
          ids: selection.changes.map((change) => change.id),
        });
        assert.equal(JSON.stringify(restored.read.value()), before);
        if (!localHistory) return;
        const savedHistory = JSON.parse(JSON.stringify(History.toJSON(editor)));
        restored.update.history.restore(
          History.fromJSON(restored, savedHistory)
        );
        for (const source of [editor, restored]) {
          source.update.history.undo();
          const view =
            action === 'accepted-delete'
              ? source
              : createEditorView(source, { authored: proposal });
          assert.deepEqual(view.read.children(), [paragraph(payload)]);
          source.update.history.redo();
          assert.deepEqual(view.read.children(), [paragraph('')]);
          if (source === editor) {
            assert.equal(
              JSON.stringify(source.read.value()).includes(marker),
              false
            );
          }
          source.update.history.undo();
          assert.deepEqual(view.read.children(), [paragraph(payload)]);
        }
      });
    }
  }

  it('keeps an opted-in archive and creates a new contribution when reverting it after reload', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph(payload)],
    });
    editor.update.text.delete({
      at: { anchor: point(0), focus: point(payload.length) },
    });
    const original = editor.read.authored.changes().items[0];
    const saved = JSON.stringify(editor.read.value());
    assert.equal(saved.includes(marker), true);
    const restored = createEditor({
      plugins: [authored({ authorId: 'bob', retainHistory: true })],
      initialValue: JSON.parse(saved),
    });
    const result = restored.update.authored.revert({
      selection: restored.read.authored.select({ ids: [original.id] }),
    });
    assert.equal(result.status, 'applied');
    if (result.status !== 'applied') {
      throw new Error('Expected retained compensation.');
    }
    assert.deepEqual(restored.read.children(), [paragraph(payload)]);
    assert.equal(restored.read.authored.change(original.id)?.authorId, 'alice');
    assert.equal(restored.read.authored.change(result.ids[0])?.authorId, 'bob');
  });

  it('keeps a compact contribution closed when its old full payload is replayed', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph(payload)],
    });
    editor.update.text.delete({
      at: { anchor: point(0), focus: point(payload.length) },
    });
    const full = editor.read.getField(authoredState);
    const change = editor.read.authored.changes().items[0];
    const operation = [...records(full.operations)]
      .map(([, value]) => value)
      .find((value): value is AuthoredEdit => value.kind === 'edit');
    assert.ok(operation);
    const compact = compactAuthoredContent(full, [change.id]);
    const stored = readRecord(compact.operations, operation.id);
    assert.ok(stored && !hasAuthoredContent(stored));
    assert.equal(JSON.stringify(compact).includes(marker), false);
    assert.equal(reduceAuthoredOperation(compact, operation), compact);
    const replayed = readRecord(compact.operations, operation.id);
    assert.ok(replayed && !hasAuthoredContent(replayed));
    assert.throws(
      () =>
        reduceAuthoredOperation(compact, {
          ...operation,
          steps: [],
        }),
      /identity collision/
    );
  });

  it('rejects a cold checkpoint that compacts pending content', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice', retainHistory: true })],
      initialValue: [paragraph(payload)],
    });
    editor.update.text.delete({
      at: { anchor: point(0), focus: point(payload.length) },
    });
    const full = editor.read.getField(authoredState);
    const change = editor.read.authored.changes().items[0];
    const compact = compactAuthoredContent(full, [change.id]);
    const operation = [...records(compact.operations)]
      .map(([, value]) => value)
      .find((value) => value.kind === 'edit');
    assert.ok(operation && !hasAuthoredContent(operation));
    const invalid = {
      ...compact,
      operations: writeRecord(compact.operations, operation.id, {
        ...operation,
        proposal: true,
      }),
    };
    assert.throws(
      () => authoredState.deserialize(authoredState.serialize(invalid)),
      /contribution identity|authored change/
    );
  });
});
