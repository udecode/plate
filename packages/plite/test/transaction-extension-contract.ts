import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  defineEditorExtension,
  defineEditorSchema,
  defineEffect,
  defineExtensionSlot,
  defineFacet,
  defineStateField,
  defineUpdateAnnotation,
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
    const incrementExtension = defineEditorExtension({
      effectTypes: [increment],
      name: 'counter-increment-effect',
    });
    const editor = createEditor({
      extensions: [counter, incrementExtension],
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
      commits[0]!.effects.map((effect) => [effect.type.key, effect.value]),
      [
        ['counter.increment', 2],
        ['counter.increment', 3],
      ]
    );
    assert.equal(increment.map(2, commits[0]!.changes!), 2);
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

    assert.equal(commits[0]!.annotations.origin, 'keyboard+paste');
    assert.equal(commits[0]!.changed.has('snapshot'), false);
  });

  it('combines static and computed facet providers with stable outputs', () => {
    const labels = defineFacet<string>({ key: 'labels' });
    let computeCount = 0;
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          facetProviders: [
            labels.of('static'),
            labels.compute(() => {
              computeCount++;
              return 'computed';
            }),
          ],
          name: 'facet-providers',
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
        counter,
        defineEditorExtension({
          facetProviders: [
            documentLength.compute(
              (state) => {
                documentComputes++;
                return state.children().length;
              },
              { dependencies: ['document'] }
            ),
            selectionOffset.compute(
              (state) => {
                selectionComputes++;
                return state.selection()?.anchor.offset ?? -1;
              },
              { dependencies: ['selection'] }
            ),
          ],
          name: 'dependency-scoped-facets',
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
      defineEditorExtension({
        facetProviders: [source.of(value)],
        name: `facet-source-${value}`,
      });
    const schemaMode = (voidKind?: 'block') =>
      defineEditorSchema({
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
        defineEditorExtension({
          facetProviders: [
            derived.compute(
              (state) => {
                derivedComputes++;
                return state.facet(source).join('').length;
              },
              { dependencies: [source] }
            ),
            schemaKind.compute(
              (state) => {
                schemaComputes++;
                return (
                  state.schema.element('quote')?.behavior.voidKind ?? 'regular'
                );
              },
              { dependencies: ['schema'] }
            ),
          ],
          name: 'dependent-facet-readers',
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
        defineEditorExtension({
          facetProviders: [
            left.compute(() => 'left', { dependencies: [right] }),
            right.compute(() => 'right', { dependencies: [left] }),
          ],
          name: 'cyclic-facets',
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
    const errors: Array<{ extension: string; phase: string }> = [];
    const mode = (value: string) =>
      defineEditorExtension({
        facetProviders: [label.of(value)],
        name: 'mode-value',
      });
    const editor = createEditor({
      extensions: [slot.of(mode('read'))] as const,
      lifecycleErrorSink(error) {
        errors.push({ extension: error.extension, phase: error.phase });
      },
    });

    assert.equal(editor.read.facet(label), 'read');

    editor.update((tx) => {
      tx.extensions.reconfigure(slot, mode('write'));
    });
    assert.equal(editor.read.facet(label), 'write');

    editor.update((tx) => {
      tx.extensions.reconfigure(
        slot,
        defineEditorExtension({
          facetProviders: [label.of('broken')],
          stateFields: [persisted],
          name: 'broken-mode',
          activate() {
            throw new Error('broken mode');
          },
        })
      );
    });
    assert.equal(editor.read.facet(label), 'broken');
    assert.equal(editor.read.getField(persisted), 'installed');
    assert.deepEqual(errors, [{ extension: 'broken-mode', phase: 'activate' }]);
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
    const editor = createEditor({ extensions: [counter] as const });

    assert.equal(dispatchCommand(editor, add, { amount: 4 }), true);
    assert.equal(editor.read.getField(counter), 4);
    assert.equal(
      editor.read.lastCommit()?.tags.includes('semantic-command'),
      true
    );
  });
});
