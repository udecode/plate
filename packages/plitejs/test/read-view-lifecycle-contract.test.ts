import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineExtension,
  type EditorStateView,
} from 'plitejs';

import { setEditorStateViewTransform, txRead } from '../src/internal';
import { replaceEditorValue } from './support/snapshot';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('read view lifecycle', () => {
  it('builds one state view per published extension configuration', () => {
    let builds = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('counter', {
          read: ({ state }) => {
            builds += 1;

            return {
              childCount: () => state.children().length,
            };
          },
        }),
      ],
    });
    replaceEditorValue(editor, { children: [paragraph('one')] });
    let initialView: EditorStateView | undefined;

    for (let index = 0; index < 10; index++) {
      editor.read((state) => {
        initialView ??= state;
        assert.equal(state, initialView);
        assert.equal(
          (
            state as typeof state & { counter: { childCount(): number } }
          ).counter.childCount(),
          1
        );
      });
    }

    editor.update((tx) => {
      tx.nodes.insert(paragraph('two'), { at: [1] });
    });

    assert.equal(editor.read.counter.childCount(), 2);
    assert.equal(builds, 1);

    const removeReplacement = editor.install(
      defineExtension('counterReplacement', {
        read: () => ({ enabled: () => true }),
      })
    );
    const replacementRead = editor.read as unknown as {
      counterReplacement: { enabled(): boolean };
    };

    assert.equal(replacementRead.counterReplacement.enabled(), true);
    assert.equal(builds, 2);
    const retainedRead = replacementRead.counterReplacement.enabled;

    removeReplacement();
    assert.equal(editor.read.counter.childCount(), 2);
    assert.equal(builds, 3);
    assert.throws(() => retainedRead(), /is not installed/);
  });

  it('keeps retained read-factory state reflection live', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('reflection', {
          read: ({ state }) => ({
            childrenFromDescriptor: () =>
              (
                Object.getOwnPropertyDescriptor(state, 'children')?.value as
                  | (() => unknown[])
                  | undefined
              )?.(),
            hasChildren: () => Object.hasOwn(state, 'children'),
            keys: () => Object.keys(state),
            prototype: () => Object.getPrototypeOf(state),
          }),
        }),
      ],
    });
    replaceEditorValue(editor, { children: [paragraph('one')] });

    assert.equal(editor.read.reflection.hasChildren(), true);
    assert.ok(editor.read.reflection.keys().includes('children'));
    assert.deepEqual(editor.read.reflection.childrenFromDescriptor(), [
      paragraph('one'),
    ]);
    assert.equal(editor.read.reflection.prototype(), Object.prototype);
  });

  it('freezes guarded read subtrees reused by later factories', () => {
    const BaseRead = defineExtension('reusedReadBase', {
      read: () => ({ nested: { ready: () => true } }),
    });
    const ReusedRead = defineExtension('reusedReadConsumer', {
      dependencies: [BaseRead],
      read: ({ state }) => ({ nested: state.reusedReadBase.nested }),
    });
    const editor = createEditor({ extensions: [ReusedRead] });

    assert.equal(editor.read.reusedReadConsumer.nested.ready(), true);
    assert.equal(
      editor.read((state) => Object.isFrozen(state.reusedReadConsumer.nested)),
      true
    );
  });

  it('invalidates when the host state-view transform changes', () => {
    const editor = createEditor();
    const first = editor.read((state) => state);
    const restore = setEditorStateViewTransform(editor, (state) => {
      state.host = Object.freeze({ ready: () => true });
    });
    const transformed = editor.read((state) => state);

    assert.notEqual(transformed, first);
    assert.equal(
      (
        transformed as typeof transformed & { host: { ready(): boolean } }
      ).host.ready(),
      true
    );

    restore();
    assert.notEqual(
      editor.read((state) => state),
      transformed
    );
  });

  it('caches one root-scoped projection per base state view', () => {
    const editor = createEditor();
    const view = createEditorView(editor);
    const first = view.read((state) => state);

    assert.equal(
      view.read((state) => state),
      first
    );

    const remove = editor.install(
      defineExtension('viewCapability', {
        read: () => ({ ready: () => true }),
      })
    );
    const viewCapabilityRead = view.read as unknown as {
      viewCapability: { ready(): boolean };
    };
    const reconfigured = view.read((state) => state);

    assert.notEqual(reconfigured, first);
    assert.equal(viewCapabilityRead.viewCapability.ready(), true);

    remove();
    assert.notEqual(
      view.read((state) => state),
      reconfigured
    );
  });

  it('keeps cached read methods live against the active transaction draft', () => {
    let builds = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('draft', {
          read: ({ state }) => {
            builds += 1;

            return {
              childCount: () => state.children().length,
              selectedContent: () => state.slice.get().content,
            };
          },
        }),
      ],
    });
    replaceEditorValue(editor, { children: [paragraph('one')] });

    assert.equal(editor.read.draft.childCount(), 1);

    editor.update((tx) => {
      tx.nodes.insert(paragraph('two'), { at: [1] });
      tx.selection.set({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      assert.equal(
        (
          tx as typeof tx & {
            draft: {
              childCount(): number;
              selectedContent(): unknown;
            };
          }
        ).draft.childCount(),
        2
      );
      assert.deepEqual(
        (
          tx as typeof tx & {
            draft: { selectedContent(): unknown };
          }
        ).draft.selectedContent(),
        [paragraph('on')]
      );
    });

    assert.equal(editor.read.draft.childCount(), 2);
    assert.equal(builds, 1);
  });

  it('invokes direct extension read methods inside editor.read', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('guard', {
          read: ({ editor: innerEditor }) => ({
            nested: {
              attemptUpdate() {
                innerEditor.update(() => {});
              },
            },
          }),
        }),
      ],
    });

    assert.throws(
      () => editor.read.guard.nested.attemptUpdate(),
      /editor\.update cannot be started inside editor\.read/
    );
    assert.throws(
      () =>
        editor.read((state) =>
          (
            state as typeof state & {
              guard: { nested: { attemptUpdate(): void } };
            }
          ).guard.nested.attemptUpdate()
        ),
      /editor\.update cannot be started inside editor\.read/
    );
  });

  it('keeps dynamic read and update facades serialization-safe', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('serializableFacade', {
          read: () => ({ ready: () => true }),
          update: () => ({ run: () => {} }),
        }),
      ],
    });

    assert.doesNotThrow(() => JSON.stringify(editor.read));
    assert.doesNotThrow(() => JSON.stringify(editor.update));
    assert.equal(typeof editor.read.name, 'string');
    assert.equal(editor.read.constructor, Function);
    assert.doesNotThrow(() => Function.prototype.toString.call(editor.read));
    assert.equal(
      JSON.stringify({
        read: editor.read.nodes,
        update: editor.update.nodes,
      }),
      '{"read":{},"update":{}}'
    );
    assert.doesNotThrow(() =>
      JSON.stringify({
        read: editor.read.serializableFacade,
        update: editor.update.serializableFacade,
      })
    );
  });

  it('resolves method names that overlap Function properties', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('collisions', {
          read: () => ({
            nested: {
              bind: () => 'bind',
              call: () => 'call',
              constructor: () => 'constructor',
              name: () => 'name',
              toString: () => 'toString',
              valueOf: () => 'valueOf',
            },
          }),
          update: () => ({
            nested: {
              call: () => {},
              name: () => {},
            },
          }),
        }),
      ],
    });

    assert.equal(editor.read.collisions.nested.name(), 'name');
    assert.equal(editor.read.collisions.nested.call(), 'call');
    assert.equal(editor.read.collisions.nested.bind(), 'bind');
    assert.equal(editor.read.collisions.nested.constructor(), 'constructor');
    assert.equal(editor.read.collisions.nested.toString(), 'toString');
    assert.equal(editor.read.collisions.nested.valueOf(), 'valueOf');
    assert.doesNotThrow(() => editor.update.collisions.nested.name());
    assert.doesNotThrow(() => editor.update.collisions.nested.call());
  });

  it('preserves nested method receivers in direct read and update facades', () => {
    let updateCalls = 0;
    const readMethods = {
      nested: {
        inspect: () => 'inspect',
        other: () => 'receiver',
        value() {
          return this.other();
        },
      },
    };
    const updateMethods = {
      nested: {
        inspect() {
          updateCalls += 1;
        },
        other() {
          updateCalls += 1;
        },
        value() {
          this.other();
        },
      },
    };
    const editor = createEditor({
      extensions: [
        defineExtension('receivers', {
          read: () => readMethods,
          update: () => updateMethods,
        }),
      ],
    });

    assert.equal(editor.read.receivers.nested.value(), 'receiver');
    assert.equal(editor.read.receivers.nested.inspect(), 'inspect');
    assert.equal(
      editor.read((state) => state.receivers.nested.value()),
      'receiver'
    );
    editor.update.receivers.nested.value();
    editor.update.receivers.nested.inspect();
    assert.equal(updateCalls, 2);
    const prototypeFacade = Reflect.get(editor.read.receivers, '__proto__');
    const inheritedMethod = Reflect.get(prototypeFacade, 'hasOwnProperty');

    assert.throws(
      () => Reflect.apply(inheritedMethod, prototypeFacade, ['nested']),
      /method "__proto__\.hasOwnProperty" is not installed/
    );
  });

  it('rejects read groups with state-derived data properties', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('invalidRead', {
          // @ts-expect-error read groups only expose callable method trees
          read: () => ({ count: 0 }),
        }),
      ],
    });

    assert.throws(
      () => editor.read((state) => state),
      /read group "invalidRead".*callable method tree/
    );
  });

  it('rejects hidden read accessors without invoking them', () => {
    let getterCalls = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('hiddenAccessor', {
          read: (() =>
            Object.defineProperty({}, 'method', {
              configurable: true,
              get: () => {
                getterCalls += 1;

                return () => true;
              },
            })) as never,
        }),
      ],
    });

    assert.throws(
      () => editor.read((state) => state),
      /accessors are not supported/
    );
    assert.equal(getterCalls, 0);
  });

  it('rejects hidden read data and symbol members', () => {
    const hiddenDataEditor = createEditor({
      extensions: [
        defineExtension('hiddenData', {
          read: (() =>
            Object.defineProperty({}, 'count', {
              value: 1,
            })) as never,
        }),
      ],
    });
    const symbolEditor = createEditor({
      extensions: [
        defineExtension('symbolRead', {
          read: (() => ({ [Symbol('method')]: () => true })) as never,
        }),
      ],
    });

    assert.throws(
      () => hiddenDataEditor.read((state) => state),
      /non-enumerable properties are not supported/
    );
    assert.throws(
      () => symbolEditor.read((state) => state),
      /symbol properties are not supported/
    );
  });

  it('rejects redefined function intrinsics without invoking them', () => {
    let getterCalls = 0;
    const method = () => true;

    Object.defineProperty(method, 'name', {
      configurable: true,
      enumerable: true,
      get: () => {
        getterCalls += 1;

        return 'method';
      },
    });
    const editor = createEditor({
      extensions: [
        defineExtension('functionIntrinsic', {
          read: () => ({ method }),
        }),
      ],
    });

    assert.throws(
      () => editor.read((state) => state),
      /function intrinsic property "name" was redefined/
    );
    assert.equal(getterCalls, 0);
  });

  it('keeps internal tx-read markers outside the callable method tree', () => {
    const method = txRead(() => true);
    const editor = createEditor({
      extensions: [
        defineExtension('markedRead', {
          read: () => ({ method }),
        }),
      ],
    });

    assert.deepEqual(
      Reflect.ownKeys(method).filter((key) => typeof key === 'symbol'),
      []
    );
    assert.equal(editor.read.markedRead.method(), true);
  });

  it('rejects reentrant reads while constructing a read group', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('reentrantRead', {
          read: ({ editor: innerEditor2 }) => {
            innerEditor2.read.value();

            return { ready: () => true };
          },
        }),
      ],
    });

    assert.throws(
      () => editor.read((state) => state),
      /editor\.read cannot be called while constructing read groups/
    );
  });
});
