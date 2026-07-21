import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  decodeEditorEffect,
  defineEditorExtension,
  defineEffect,
  defineStateField,
  defineValueCodec,
  DocumentChange,
  type Element,
  type EditorEffect,
  invertEffect,
  mapEffect,
  valueCodecs,
} from '@platejs/plite';
import {
  getCollabEffects as editorGetCollabEffects,
  getLastCommit as editorGetLastCommit,
  subscribeSource as editorSubscribeSource,
} from '@platejs/plite/internal';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Element;

describe('document state effect contract', () => {
  it('writes state fields as effect commits', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: valueCodecs.string,
    });
    const children: Element[] = [paragraph('body')];
    const editor = createEditor({
      extensions: [documentTitle] as const,
      initialValue: {
        children,
        meta: { [documentTitle.key]: documentTitle.serialize('Q2 Plan') },
      },
    });
    const stateCommits: NonNullable<ReturnType<typeof editorGetLastCommit>>[] =
      [];
    const unsubscribe = editorSubscribeSource(
      editor,
      'state',
      (_snapshot, commit) => {
        if (commit) stateCommits.push(commit);
      }
    );

    editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });
    unsubscribe();

    const commit = editorGetLastCommit(editor);

    assert(commit);
    assert.equal(editor.read.getField(documentTitle), 'Q3 Plan');
    assert.deepEqual(commit.effects, [
      {
        type: documentTitle.effect,
        value: { previousValue: 'Q2 Plan', value: 'Q3 Plan' },
      },
    ]);
    assert.deepEqual(commit.dirtyStateKeys, [documentTitle.key]);
    assert.equal(commit.changed.has('document'), false);
    assert.equal(commit.changed.has('snapshot'), true);
    assert.deepEqual(stateCommits, [commit]);
    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      meta: { [documentTitle.key]: documentTitle.serialize('Q3 Plan') },
    });
    assert.deepEqual(
      editor.read((state) => documentTitle.effect.collabSnapshot?.(state)),
      { previousValue: 'Q3 Plan', value: 'Q3 Plan' }
    );
  });

  it('requires an explicit absolute snapshot for latest shared effects', () => {
    const defineStringEffect = defineEffect<string>;

    assert.throws(
      () =>
        defineStringEffect({
          codec: valueCodecs.string,
          collab: 'shared',
          collabReplay: 'latest',
          key: 'missing-latest-snapshot',
        } as unknown as Parameters<typeof defineStringEffect>[0]),
      /requires collabSnapshot/
    );
  });

  it('supports compact shared state transitions as domain effects', () => {
    type LargeCounter = { body: string; count: number };
    const increment = defineEffect<number>({
      codec: valueCodecs.number,
      collab: 'shared',
      collabReplay: 'live',
      history: 'push',
      invert: (value) => -value,
      key: 'document.large-counter.increment',
    });
    const largeCounter = defineStateField<LargeCounter>({
      key: 'document.large-counter',
      initial: () => ({ body: 'x'.repeat(40_000), count: 0 }),
      persist: defineValueCodec<LargeCounter>({
        decode(value) {
          if (
            typeof value !== 'object' ||
            value === null ||
            typeof (value as LargeCounter).body !== 'string' ||
            typeof (value as LargeCounter).count !== 'number'
          ) {
            throw new Error('Invalid large counter.');
          }

          return value as LargeCounter;
        },
        encode: (value) => value,
        version: 1,
      }),
      reduce: (value, effect) =>
        effect.type === increment
          ? { ...value, count: value.count + effect.value }
          : value,
    });
    const incrementExtension = defineEditorExtension({
      effects: [increment],
      name: 'document-large-counter-increment-effect',
    });
    const createCounterEditor = () =>
      createEditor({
        extensions: [largeCounter, incrementExtension] as const,
        initialValue: [paragraph('body')],
      });
    const source = createCounterEditor();
    const remote = createCounterEditor();

    source.update((tx) => {
      tx.effects.emit(increment, 2);
    });

    const commit = editorGetLastCommit(source);

    assert(commit);
    assert.deepEqual(commit.effects, [{ type: increment, value: 2 }]);
    assert.equal(JSON.stringify(commit.effects).includes('xxxxx'), false);

    remote.update((tx) => {
      for (const effect of editorGetCollabEffects(source, commit)) {
        tx.effects.emit(effect.type, effect.value);
      }
    });

    assert.deepEqual(remote.read.getField(largeCounter), {
      body: 'x'.repeat(40_000),
      count: 2,
    });
  });

  it('collapses consecutive field writes back to the transaction baseline', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      history: 'push',
      initial: () => 'Untitled',
      persist: valueCodecs.string,
    });
    const editor = createEditor({
      extensions: [documentTitle] as const,
      initialValue: {
        children: [paragraph('body')],
        meta: { [documentTitle.key]: documentTitle.serialize('Q2 Plan') },
      },
    });
    let commits = 0;
    const unsubscribe = editor.subscribe((_snapshot, commit) => {
      if (commit) commits++;
    });

    editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
      tx.setField(documentTitle, 'Q2 Plan');
    });
    unsubscribe();

    assert.equal(editor.read.getField(documentTitle), 'Q2 Plan');
    assert.equal(commits, 0);
  });

  it('deeply freezes emitted, mapped, inverted, and decoded effect values', () => {
    type Payload = { nested: { count: number } };
    const codec = defineValueCodec<Payload>({
      decode: (value) => value as Payload,
      encode: (value) => value,
      version: 1,
    });
    const effect = defineEffect<Payload>({
      codec,
      invert: (value) => ({ nested: { count: -value.nested.count } }),
      key: 'nested-effect-value',
      map: (value) => ({ nested: { count: value.nested.count + 1 } }),
    });
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          effects: [effect],
          name: 'nested-effect-values',
        }),
      ] as const,
    });
    const input = { nested: { count: 1 } };

    editor.update((tx) => tx.effects.emit(effect, input));
    input.nested.count = 99;

    const commit = editorGetLastCommit(editor);

    assert(commit);

    const emitted = commit.effects[0] as EditorEffect<Payload>;
    const mapped = mapEffect(emitted, new DocumentChange());
    const inverted = invertEffect(emitted);
    const decoded = decodeEditorEffect(effect, {
      key: effect.key,
      value: { nested: { count: 3 } },
      version: 1,
    });

    assert.equal(emitted.value.nested.count, 1);
    assert.equal(mapped?.value.nested.count, 2);
    assert.equal(inverted.value.nested.count, -1);
    assert.equal(decoded.value.nested.count, 3);
    for (const candidate of [emitted, mapped, inverted, decoded]) {
      assert(candidate);
      assert.equal(Object.isFrozen(candidate.value), true);
      assert.equal(Object.isFrozen(candidate.value.nested), true);
    }
    assert.throws(() => {
      emitted.value.nested.count = 2;
    }, TypeError);
  });
});
