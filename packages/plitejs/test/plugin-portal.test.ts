import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  definePlugin,
  type EditorCommit,
  txOnly,
  txLocate,
} from 'plitejs';
import { compilePluginInput, initializePluginEntries } from 'plitejs/internal';

describe('plugin portal', () => {
  it('selects one installed plugin group by descriptor or name', () => {
    const WriterPlugin = definePlugin('writerTransaction', {
      read: ({ state }) => ({ text: () => state.text.string([]) }),
      update: ({ tx }) => ({
        append: txLocate(false, (value: string) => {
          tx.text.insert(value, { at: { offset: 4, path: [0, 0] } });
        }),
      }),
    });
    const editor = createEditor({
      plugins: [WriterPlugin] as const,
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    editor.update((tx) => {
      assert.equal(tx.plugin(WriterPlugin).text(), 'test');
      tx.plugin(WriterPlugin.name).append('!');
    });

    assert.equal(editor.read.text.string([]), 'test!');
  });

  it('preserves a direct transaction group named plugin', () => {
    let calls = 0;
    const Plugin = definePlugin('plugin', {
      update: () => ({ run: () => (calls += 1) }),
    });
    const editor = createEditor({ plugins: [Plugin] as const });

    editor.update((tx) => {
      tx.plugin(Plugin).run();
      tx.plugin(Plugin.name).run();
      tx.plugin.run();
    });

    assert.equal(calls, 3);
  });

  it('rejects a same-name descriptor that is not installed', () => {
    const Installed = definePlugin('transactionIdentity', {
      update: () => ({ run: () => undefined }),
    });
    const Sibling = definePlugin('transactionIdentity', {
      update: () => ({ run: () => undefined }),
    });
    const editor = createEditor({ plugins: [Installed] as const });

    assert.throws(
      () => editor.update((tx) => tx.plugin(Sibling).run()),
      /is not installed/
    );
  });

  it('rejects a name that is not installed', () => {
    const editor = createEditor();

    assert.throws(
      () => editor.update((tx) => tx.plugin('missing').run()),
      /is not installed/
    );
  });

  it('applies an update policy to one descriptor-scoped method', () => {
    const WriterPlugin = definePlugin('writer', {
      update: ({ tx }) => ({
        nested: {
          append() {
            tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
          },
        },
      }),
    });
    const editor = createEditor({
      plugins: [WriterPlugin],
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });
    let commit: EditorCommit | undefined;

    editor.subscribeCommit((nextCommit) => {
      commit = nextCommit;
    });

    editor.plugin(WriterPlugin).update({ tags: 'scoped' }).nested.append();

    assert.equal(editor.read.text.string([]), 'test!');
    assert.deepEqual(commit?.tags, ['scoped']);
  });

  it('refuses reads and transaction-only methods through both portal forms', () => {
    let controlRuns = 0;
    const Probe = definePlugin('portalProbe', {
      read: ({ state }) => ({ peek: () => state.text.string([]) }),
      update: ({ tx }) => ({
        control: txOnly(() => {
          controlRuns += 1;
        }),
        direct() {
          tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
        },
      }),
    });
    const editor = createEditor({
      plugins: [Probe] as const,
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });
    const portal = editor.plugin(Probe).update as unknown as Record<
      string,
      (...args: unknown[]) => unknown
    > &
      ((policy: { tags: string }) => Record<string, () => unknown>);
    const { version } = editor.read.runtime.snapshot();

    assert.throws(() => portal.peek(), /is read-only\./);
    assert.throws(() => portal({ tags: 'scoped' }).peek(), /is read-only\./);
    assert.throws(() => portal.control(), /is transaction-only\./);
    assert.throws(
      () => portal({ tags: 'scoped' }).control(),
      /is transaction-only\./
    );
    assert.equal(controlRuns, 0);
    assert.equal(editor.read.runtime.snapshot().version, version);

    let commit: EditorCommit | undefined;

    editor.subscribeCommit((nextCommit) => {
      commit = nextCommit;
    });
    portal({ tags: 'scoped' }).direct();

    assert.equal(editor.read.text.string([]), 'test!');
    assert.deepEqual(commit?.tags, ['scoped']);
  });

  it('refuses a transaction-only callable group and its members through direct calls', () => {
    let runs = 0;
    const Control = definePlugin('rootControl', {
      update: () =>
        txOnly(Object.assign(() => (runs += 1), { child: () => (runs += 1) })),
    });
    const editor = createEditor({ plugins: [Control] as const });
    const direct = editor.update as unknown as Record<
      string,
      { call: (thisArg: unknown) => unknown; child: () => unknown }
    >;
    const portal = editor.plugin(Control).update as unknown as {
      child: () => unknown;
    };

    assert.throws(() => portal.child(), /is transaction-only\./);
    assert.throws(() => direct.rootControl.child(), /is transaction-only\./);
    assert.throws(
      () => direct.rootControl.call(undefined),
      /is transaction-only\./
    );
    assert.equal(runs, 0);

    editor.update((tx) => {
      (
        tx as unknown as Record<string, { child: () => unknown }>
      ).rootControl.child();
    });

    assert.equal(runs, 1);
  });

  it('runs an update method defined by a getter beside a read group', () => {
    let runs = 0;
    const Getter = definePlugin('getterUpdate', {
      read: () => ({ peek: () => runs }),
      update: () => ({
        get write() {
          return () => (runs += 1);
        },
      }),
    });
    const editor = createEditor({ plugins: [Getter] as const });

    editor.plugin(Getter).update.write();
    editor.update.getterUpdate.write();

    assert.equal(runs, 2);
  });

  it('runs a getter-defined update method through an editor view', () => {
    let runs = 0;
    const Getter = definePlugin('getterViewUpdate', {
      read: () => ({ peek: () => runs }),
      update: () => ({
        get write() {
          return () => (runs += 1);
        },
      }),
    });
    const view = createEditorView(createEditor({ plugins: [Getter] as const }));

    view.plugin(Getter).update.write();
    view.update.getterViewUpdate.write();

    assert.equal(runs, 2);
  });

  it('refuses a transaction-only callable group named plugin through direct calls', () => {
    let runs = 0;
    const Control = definePlugin('plugin', {
      update: () =>
        txOnly(Object.assign(() => undefined, { child: () => (runs += 1) })),
    });
    const editor = createEditor({ plugins: [Control] as const });
    const direct = editor.update as unknown as Record<
      string,
      { child: () => unknown }
    >;
    const portal = editor.plugin(Control).update as unknown as {
      child: () => unknown;
    };

    assert.throws(() => portal.child(), /is transaction-only\./);
    assert.throws(() => direct.plugin.child(), /is transaction-only\./);
    assert.equal(runs, 0);

    editor.update((tx) => {
      (
        tx as unknown as Record<string, { child: () => unknown }>
      ).plugin.child();
    });

    assert.equal(runs, 1);
  });

  it('runs both portal forms on a plugin named plugin', () => {
    let calls = 0;
    const Plugin = definePlugin('plugin', {
      update: () => ({ run: () => (calls += 1) }),
    });
    const editor = createEditor({ plugins: [Plugin] as const });

    editor.plugin(Plugin).update({ tags: 'scoped' }).run();
    editor.plugin(Plugin).update.run();

    assert.equal(calls, 2);
  });

  it('rejects update method names reserved by JavaScript protocols', () => {
    const ReservedPlugin = definePlugin('reservedUpdateMethods', {
      update: () => ({
        nested: {
          then: () => {},
          toJSON: () => {},
        },
      }),
    });
    const editor = createEditor({ plugins: [ReservedPlugin] });

    assert.throws(
      () => editor.update(() => {}),
      /method "nested\.(?:then|toJSON)" uses a reserved protocol name/
    );
  });

  it('reports optional descriptor presence without weakening capability access', () => {
    const Installed = definePlugin('optionalPresence', {
      api: () => ({ value: () => 'installed' }),
    });
    const Missing = definePlugin('optionalPresence', {
      api: () => ({ value: () => 'missing' }),
    });
    const editor = createEditor({ plugins: [Installed] });

    assert.equal(editor.plugin(Installed).installed, true);
    assert.equal(editor.plugin(Missing).installed, false);
    assert.throws(() => editor.plugin(Missing).api.value(), /is not installed/);
  });

  it('resolves an adopted source reference to its installed descriptor', () => {
    const Source = definePlugin('adoptedSource', {
      api: () => ({ value: () => 'source' }),
    });
    const Installed = definePlugin('adoptedSource', {
      api: () => ({ value: () => 'installed' }),
    });
    const Sibling = definePlugin('adoptedSource', {
      api: () => ({ value: () => 'sibling' }),
    });
    const editor = createEditor();

    initializePluginEntries(editor, [
      compilePluginInput(
        Installed,
        { api: () => ({ value: () => 'installed' }) },
        { sources: [Source] }
      ),
    ]);

    assert.equal(editor.plugin(Source).installed, true);
    assert.equal(editor.plugin(Source).api.value(), 'installed');
    assert.equal(editor.plugin(Sibling).installed, false);
    assert.throws(() => editor.plugin(Sibling).api.value(), /is not installed/);
  });

  it('resolves conflicts through adopted source references', () => {
    const Source = definePlugin('adoptedConflict', {});
    const Installed = definePlugin('adoptedConflict', {});
    const Pending = definePlugin('pendingConflict', {
      conflicts: [Source],
    });
    const editor = createEditor();

    initializePluginEntries(editor, [
      compilePluginInput(Installed, {}, { sources: [Source] }),
    ]);

    assert.throws(() => editor.install(Pending), /conflicts with/);
    assert.equal(editor.plugin(Installed).installed, true);
    assert.equal(editor.plugin(Pending).installed, false);
  });
});
