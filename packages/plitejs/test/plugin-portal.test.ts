import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, definePlugin, type EditorCommit } from 'plitejs';
import { compilePluginInput, initializePluginEntries } from 'plitejs/internal';

describe('plugin portal', () => {
  it('selects one installed plugin group by descriptor or name', () => {
    const WriterPlugin = definePlugin('writerTransaction', {
      read: ({ state }) => ({ text: () => state.text.string([]) }),
      update: ({ tx }) => ({
        append(value: string) {
          tx.text.insert(value, { at: { offset: 4, path: [0, 0] } });
        },
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
