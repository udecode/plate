import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  defineEditorExtension,
  defineStateField,
  type Element,
  type EditorUpdateTag,
  txOnly,
} from '@platejs/plite';

import { replaceEditorValue } from './support/snapshot';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const historyCapability = defineEditorExtension({
  name: 'history',
  tx: {
    history() {
      return {};
    },
  },
});

const workflowCapability = defineEditorExtension({
  name: 'workflow',
  tx: {
    workflow(tx) {
      return {
        direct(text: string) {
          tx.text.insert(text);
        },
        scoped: txOnly((text: string) => {
          tx.text.insert(text);
        }),
      };
    },
  },
});

const escapedState = defineStateField({
  key: 'update-policy.escaped-state',
  initial: () => '',
});

describe('update policy contract', () => {
  it('configures one direct update with semantic history policy', () => {
    const editor = createEditor({
      extensions: [historyCapability] as const,
    });

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update({ history: 'skip' }).text.insert('!');

    assert.equal(editor.read.text.string([]), 'one!');
    assert.deepEqual(editor.read.lastCommit()?.tags, [
      'history-skip',
      'semantic-command',
    ]);
  });

  it('runs a policy-first callback as one atomic commit', () => {
    const editor = createEditor({
      extensions: [historyCapability] as const,
    });

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const commits = [] as unknown[];
    const unsubscribe = editor.subscribeCommit((commit) => {
      commits.push(commit);
    });

    editor.update({ history: 'new-batch', tags: 'paste' }, (tx, context) => {
      context.afterCommit(() => {});
      tx.text.insert('!');
      tx.text.insert('?');
    });
    unsubscribe();

    assert.equal(editor.read.text.string([]), 'one!?');
    assert.equal(commits.length, 1);
    assert.deepEqual(editor.read.lastCommit()?.tags, ['paste', 'history-push']);
  });

  it('keeps only the last history intent', () => {
    const editor = createEditor({
      extensions: [historyCapability] as const,
    });

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update(
      {
        history: 'skip',
        tags: ['history-merge', 'paste', 'history-push'],
      },
      (tx) => tx.text.insert('!')
    );

    assert.deepEqual(editor.read.lastCommit()?.tags, ['paste', 'history-skip']);
  });

  it('lets the active transaction replace history intent and inspect tags', () => {
    const editor = createEditor({
      extensions: [historyCapability] as const,
    });

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update({ history: 'skip' }, (tx) => {
      assert.equal(tx.tags.has('history-skip'), true);
      tx.tags.add('history-merge');
      tx.tags.add('paste');
      assert.equal(tx.tags.has('history-skip'), false);
      assert.equal(tx.tags.has('history-merge'), true);
      tx.text.insert('!');
    });

    assert.deepEqual(editor.read.lastCommit()?.tags, [
      'history-merge',
      'paste',
    ]);
  });

  it('keeps outer update tags visible through command spec continuations', () => {
    const handlerTags: EditorUpdateTag[][] = [];
    const definitionTags: EditorUpdateTag[][] = [];
    const command = defineCommand<{ text: string }>('update-policy.insert', {
      build: ({ input, state, tags }) => {
        const inferredTags: readonly EditorUpdateTag[] = tags;

        assert.equal(Object.isFrozen(inferredTags), true);
        assert.throws(
          () => Array.prototype.push.call(inferredTags, 'mutated'),
          TypeError
        );
        definitionTags.push([...inferredTags]);

        return state.transaction((tx) => tx.text.insert(input.text));
      },
    });
    const extension = defineEditorExtension({
      commands: ({ around, handle }) => [
        around(command, ({ state, next }) =>
          next.after(state.transaction((tx) => tx.tags.add('command-prefix')))
        ),
        handle(command, ({ tags }) => {
          const inferredTags: readonly EditorUpdateTag[] = tags;

          assert.equal(Object.isFrozen(inferredTags), true);
          handlerTags.push([...inferredTags]);
          return false;
        }),
      ],
      name: 'update-policy.command-tag-observer',
    });

    const editor = createEditor({ extensions: [extension] as const });
    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.update({ tags: 'outer-policy' }).command(command, { text: '!' });

    assert.deepEqual(handlerTags, [['outer-policy', 'command-prefix']]);
    assert.deepEqual(definitionTags, [['outer-policy', 'command-prefix']]);
    assert.deepEqual(editor.read.lastCommit()?.tags, [
      'outer-policy',
      'semantic-command',
      'command-prefix',
    ]);
  });

  it('rejects history policy before mutation when history is not installed', () => {
    const editor = createEditor();

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const version = editor.read.runtime.snapshot().version;

    assert.throws(
      () =>
        (
          editor.update as unknown as (
            policy: Record<string, string>
          ) => typeof editor.update
        )({ history: 'skip' }).text.insert('!'),
      /requires the history extension/
    );
    assert.equal(editor.read.text.string([]), 'one');
    assert.equal(editor.read.runtime.snapshot().version, version);
  });

  it('rejects nested public updates and discards the outer draft', () => {
    const editor = createEditor({
      extensions: [historyCapability] as const,
    });

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const version = editor.read.runtime.snapshot().version;

    assert.throws(
      () =>
        editor.update({ history: 'skip' }, (tx) => {
          tx.text.insert('!');
          editor.update.text.insert('?');
        }),
      /cannot be nested/
    );
    assert.equal(editor.read.text.string([]), 'one');
    assert.equal(editor.read.runtime.snapshot().version, version);

    editor.update.text.insert('!');
    assert.equal(editor.read.text.string([]), 'one!');
  });

  it('rejects thenable callbacks and disables the escaped transaction', async () => {
    const editor = createEditor({
      extensions: [
        historyCapability,
        workflowCapability,
        escapedState,
      ] as const,
    });

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const version = editor.read.runtime.snapshot().version;
    let release!: () => void;
    let settle!: () => void;
    const escapedErrors: unknown[] = [];
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const settled = new Promise<void>((resolve) => {
      settle = resolve;
    });

    assert.throws(
      () =>
        editor.update(async (tx) => {
          tx.text.insert('!');
          await gate;

          for (const mutate of [
            () => tx.text.insert('?'),
            () => tx.workflow.direct('?'),
            () => tx.setField(escapedState, 'escaped'),
            () => tx.tags.add('escaped'),
          ]) {
            try {
              mutate();
            } catch (error) {
              escapedErrors.push(error);
            }
          }

          settle();
        }),
      /must be synchronous/
    );
    assert.equal(editor.read.text.string([]), 'one');
    assert.equal(editor.read.runtime.snapshot().version, version);

    release();
    await settled;

    assert.equal(escapedErrors.length, 4);
    for (const error of escapedErrors) {
      assert.match(String(error), /transaction is no longer active/);
    }
    assert.equal(editor.read.text.string([]), 'one');
    assert.equal(editor.read.runtime.snapshot().version, version);

    editor.update.text.insert('!');
    assert.equal(editor.read.text.string([]), 'one!');
  });

  it('reuses semantic facades and materialized method paths', () => {
    const editor = createEditor({
      extensions: [historyCapability] as const,
    });
    const taggedPolicy = { tags: ['paste'] } as const;

    const firstSkip = editor.update({ history: 'skip' });
    const secondSkip = editor.update({ history: 'skip' });
    const firstTagged = editor.update(taggedPolicy);
    const secondTagged = editor.update(taggedPolicy);
    const otherTagged = editor.update({ tags: ['paste'] });

    assert.equal(firstSkip, secondSkip);
    assert.equal(firstTagged, secondTagged);
    assert.notEqual(firstTagged, otherTagged);
    assert.equal(editor.update.nodes, editor.update.nodes);
    assert.equal(editor.update.nodes.insert, editor.update.nodes.insert);
    assert.equal(firstSkip.nodes, firstSkip.nodes);
    assert.equal(firstSkip.nodes.insert, firstSkip.nodes.insert);
  });

  it('revalidates History when invoking a cached semantic facade', () => {
    const editor = createEditor();
    const removeHistory = editor.extend(historyCapability);
    const configureUpdate = editor.update as unknown as (policy: {
      history: 'skip';
    }) => typeof editor.update;
    const skip = configureUpdate({ history: 'skip' });

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    removeHistory();

    assert.throws(
      () => skip.text.insert('!'),
      /requires the history extension/
    );
    assert.equal(editor.read.text.string([]), 'one');
  });

  it('snapshots mutable policy objects when creating a facade', () => {
    const editor = createEditor();
    const policy = { tags: ['paste'] };
    const paste = editor.update(policy);

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    policy.tags.push('external');
    paste.text.insert('!');

    assert.deepEqual(editor.read.lastCommit()?.tags, [
      'paste',
      'semantic-command',
    ]);
  });

  it('rejects transaction-only methods from dynamic direct dispatch', () => {
    const editor = createEditor({
      extensions: [workflowCapability] as const,
    });

    replaceEditorValue(editor, {
      children: [paragraph('one')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const version = editor.read.runtime.snapshot().version;
    const dynamicUpdate = editor.update as unknown as Record<
      string,
      Record<string, (...args: unknown[]) => unknown>
    >;

    assert.throws(
      () => dynamicUpdate.workflow!.scoped!('!'),
      /transaction-only/
    );
    assert.equal(editor.read.text.string([]), 'one');
    assert.equal(editor.read.runtime.snapshot().version, version);

    editor.update.workflow.direct('!');
    assert.equal(editor.read.text.string([]), 'one!');
  });
});
