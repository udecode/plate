import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  defineExtension,
  defineEditorSchema,
  defineEffect,
  defineExtensionSlot,
  defineFacet,
  defineStateField,
  defineUpdateAnnotation,
  EditorExtensionPublicationError,
  type EditorCommit,
  schema,
} from '@platejs/plite';
import { dispatchCommand } from '@platejs/plite/internal';

describe('transaction extension values', () => {
  it('reduces typed effects into fields and publishes mapped commit effects', () => {
    const increment = defineEffect<number>({
      invert: (value) => -value,
      key: 'counter.increment',
      map: (value) => value,
    });
    const counter = defineStateField({
      key: 'counter',
      initial: () => 0,
      reduce: (value, effect) =>
        effect.type === increment ? value + effect.value : value,
    });
    const incrementExtension = defineExtension('counter-increment-effect', {
      effectTypes: [increment],
      stateFields: [counter],
    });
    const editor = createEditor({
      extensions: [incrementExtension],
    });
    const commits: EditorCommit[] = [];

    editor.subscribeCommit((nextCommit) => {
      commits.push(nextCommit);
    });
    editor.update((tx) => {
      tx.effects.emit(increment, 2);
      tx.effects.emit(increment, 3);
    });

    assert.equal(editor.read.getField(counter), 5);
    assert.deepEqual(
      commits[0].effects.map((effect) => [effect.type.key, effect.value]),
      [
        ['counter.increment', 2],
        ['counter.increment', 3],
      ]
    );
    assert.equal(increment.map(2, commits[0].changes), 2);
    assert.equal(increment.invert(2), -2);
  });

  it('combines typed update annotations by key', () => {
    const origin = defineUpdateAnnotation<string>({
      combine: (previous, next) => `${previous}+${next}`,
      key: 'origin',
    });
    const editor = createEditor();
    const commits: EditorCommit[] = [];

    editor.subscribeCommit((nextCommit) => {
      commits.push(nextCommit);
    });
    editor.update((tx) => {
      tx.annotations.set(origin, 'keyboard');
      tx.annotations.set(origin, 'paste');
    });

    assert.equal(commits[0].annotations.origin, 'keyboard+paste');
    assert.equal(commits[0].changed.has('snapshot'), false);
  });

  it('combines static and computed facet providers with stable outputs', () => {
    const labels = defineFacet<string>({ key: 'labels' });
    let computeCount = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('facet-providers', {
          facetProviders: [
            labels.of('static'),
            labels.compute(() => {
              computeCount += 1;
              return 'computed';
            }),
          ],
        }),
      ],
    });

    const first = editor.read.facet(labels);
    const second = editor.read.facet(labels);

    assert.deepEqual(first, ['static', 'computed']);
    assert.equal(second, first);
    assert.equal(computeCount, 1);
  });

  it('recomputes computed facets only when declared state dependencies change', () => {
    const documentLength = defineFacet<number>({ key: 'document-length' });
    const selectionOffset = defineFacet<number>({ key: 'selection-offset' });
    const counter = defineStateField({
      key: 'unrelated-counter',
      initial: () => 0,
    });
    let documentComputes = 0;
    let selectionComputes = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('dependency-scoped-facets', {
          facetProviders: [
            documentLength.compute(
              (state) => {
                documentComputes += 1;
                return state.children().length;
              },
              { dependencies: ['document'] }
            ),
            selectionOffset.compute(
              (state) => {
                selectionComputes += 1;
                const selection = state.selection();

                return selection?.anchor.offset ?? -1;
              },
              { dependencies: ['selection'] }
            ),
          ],
          stateFields: [counter],
        }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'alpha' }] }],
    });

    assert.deepEqual(editor.read.facet(documentLength), [1]);
    assert.deepEqual(editor.read.facet(selectionOffset), [-1]);

    editor.update((tx) => tx.setField(counter, 1));
    assert.deepEqual(editor.read.facet(documentLength), [1]);
    assert.deepEqual(editor.read.facet(selectionOffset), [-1]);
    assert.equal(documentComputes, 1);
    assert.equal(selectionComputes, 1);

    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
    });
    assert.deepEqual(editor.read.facet(documentLength), [1]);
    assert.deepEqual(editor.read.facet(selectionOffset), [2]);
    assert.equal(documentComputes, 1);
    assert.equal(selectionComputes, 2);

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 5, path: [0, 0] } });
    });
    assert.deepEqual(editor.read.facet(documentLength), [1]);
    assert.deepEqual(editor.read.facet(selectionOffset), [2]);
    assert.equal(documentComputes, 2);
    assert.equal(selectionComputes, 2);
  });

  it('tracks declared facet and schema dependencies', () => {
    const source = defineFacet<string>({ key: 'facet-source' });
    const derived = defineFacet<number>({ key: 'facet-derived' });
    const schemaKind = defineFacet<string>({ key: 'schema-kind' });
    const sourceSlot = defineExtensionSlot('facet-source-slot');
    const schemaSlot = defineExtensionSlot('facet-schema-slot');
    let derivedComputes = 0;
    let schemaComputes = 0;
    const sourceMode = (value: string) =>
      defineExtension(`facet-source-${value}`, {
        facetProviders: [source.of(value)],
      });
    const schemaMode = (voidKind?: 'block') =>
      defineEditorSchema('schema:facet-schema', {
        elements: {
          quote: voidKind
            ? { void: voidKind }
            : { content: schema.content.text() },
        },
        id: 'facet-schema',
        root: schema.content.type('quote'),
        unknown: 'reject',
        version: voidKind ? 2 : 1,
      });
    const editor = createEditor({
      extensions: [
        defineExtension('dependent-facet-readers', {
          facetProviders: [
            derived.compute(
              (state) => {
                derivedComputes += 1;
                return state.facet(source).join('').length;
              },
              { dependencies: [source] }
            ),
            schemaKind.compute(
              (state) => {
                schemaComputes += 1;
                return (
                  state.schema.element('quote')?.behavior.voidKind ?? 'regular'
                );
              },
              { dependencies: ['schema'] }
            ),
          ],
        }),
        sourceSlot.of(sourceMode('one')),
        schemaSlot.of(schemaMode()),
      ] as const,
    });

    assert.deepEqual(editor.read.facet(derived), [3]);
    assert.deepEqual(editor.read.facet(schemaKind), ['regular']);
    assert.equal(derivedComputes, 1);
    assert.equal(schemaComputes, 1);

    editor.update((tx) => {
      tx.extensions.reconfigure(sourceSlot, sourceMode('three'));
    });
    assert.deepEqual(editor.read.facet(derived), [5]);
    assert.deepEqual(editor.read.facet(schemaKind), ['regular']);
    assert.equal(derivedComputes, 2);
    assert.equal(schemaComputes, 1);

    editor.update((tx) => {
      tx.extensions.reconfigure(schemaSlot, schemaMode('block'));
    });
    assert.deepEqual(editor.read.facet(derived), [5]);
    assert.deepEqual(editor.read.facet(schemaKind), ['block']);
    assert.equal(derivedComputes, 2);
    assert.equal(schemaComputes, 2);
  });

  it('rejects cyclic computed facet dependencies without publishing a cache', () => {
    const left = defineFacet<string>({ key: 'cycle-left' });
    const right = defineFacet<string>({ key: 'cycle-right' });
    const editor = createEditor({
      extensions: [
        defineExtension('cyclic-facets', {
          facetProviders: [
            left.compute(() => 'left', { dependencies: [right] }),
            right.compute(() => 'right', { dependencies: [left] }),
          ],
        }),
      ],
    });

    assert.throws(
      () => editor.read.facet(left),
      /Cyclic editor facet dependency: cycle-left -> cycle-right -> cycle-left/
    );
    assert.throws(
      () => editor.read.facet(right),
      /Cyclic editor facet dependency: cycle-right -> cycle-left -> cycle-right/
    );
  });

  it('atomically reconfigures named extension slots', () => {
    const label = defineFacet<string, string>({
      combine: (values) => values.join('+'),
      key: 'label',
    });
    const slot = defineExtensionSlot('mode');
    const persisted = defineStateField({
      initial: () => 'installed',
      key: 'mode-state',
    });
    const errors: Array<{ extensionName: string; phase: string }> = [];
    const mode = (value: string) =>
      defineExtension('mode-value', {
        facetProviders: [label.of(value)],
      });
    const editor = createEditor({
      extensions: [slot.of(mode('read'))] as const,
      lifecycleErrorSink(error) {
        errors.push({ extensionName: error.extensionName, phase: error.phase });
      },
    });

    assert.equal(editor.read.facet(label), 'read');

    editor.update((tx) => {
      tx.extensions.reconfigure(slot, mode('write'));
    });
    assert.equal(editor.read.facet(label), 'write');

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.extensions.reconfigure(
            slot,
            defineExtension('broken-mode', {
              facetProviders: [label.of('broken')],
              stateFields: [persisted],
              activate() {
                throw new Error('broken mode');
              },
            })
          );
        }),
      EditorExtensionPublicationError
    );
    assert.equal(editor.read.facet(label), 'write');
    assert.throws(() => editor.read.getField(persisted), /not installed/);
    assert.deepEqual(errors, []);
  });

  it('runs typed command defaults headlessly inside one update', () => {
    type AddCommand = { amount: number };
    const counter = defineStateField({ key: 'counter', initial: () => 0 });
    const add = defineCommand<AddCommand>('counter.add', {
      build: ({ input, state }) =>
        state.transaction((tx) => {
          tx.setField(counter, (value) => value + input.amount);
        }),
    });
    const editor = createEditor({
      extensions: [
        defineExtension('counter-state', { stateFields: [counter] }),
      ] as const,
    });

    assert.equal(dispatchCommand(editor, add, { amount: 4 }), true);
    assert.equal(editor.read.getField(counter), 4);
    assert.equal(
      editor.read.lastCommit()?.tags.includes('semantic-command'),
      true
    );
  });
});
