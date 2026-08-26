import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineExtension,
  defineEditorSchema,
  defineExtensionSlot,
  defineFacet,
  defineStateField,
  NodeApi,
  schema,
} from '@platejs/plite';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph' as const,
});

describe('transaction-local facet caching', () => {
  it('invalidates every visible dependency against the active draft', () => {
    const counter = defineStateField({ initial: 0, key: 'draft-counter' });
    const documentText = defineFacet<string>({ key: 'draft-document-text' });
    const mainText = defineFacet<string>({ key: 'draft-main-text' });
    const sidebarText = defineFacet<string>({ key: 'draft-sidebar-text' });
    const selectionOffset = defineFacet<number>({
      key: 'draft-selection-offset',
    });
    const counterValue = defineFacet<number>({ key: 'draft-counter-value' });
    const doubledCounter = defineFacet<number>({
      key: 'draft-doubled-counter',
    });
    const schemaKind = defineFacet<string>({ key: 'draft-schema-kind' });
    const wholeState = defineFacet<string>({ key: 'draft-whole-state' });
    const schemaSlot = defineExtensionSlot('draft-schema-slot');
    const schemaMode = (voidKind?: 'block') =>
      defineEditorSchema('schema:draft-schema', {
        elements: {
          paragraph: { content: schema.content.text() } as const,
          quote: voidKind
            ? { void: voidKind }
            : { content: schema.content.text() },
        },
        id: 'draft-schema',
        root: schema.content.types(['paragraph', 'quote']),
        roots: {
          sidebar: schema.content.types(['paragraph', 'quote']),
        },
        unknown: 'reject',
        version: voidKind ? 2 : 1,
      });
    const editor = createEditor({
      extensions: [
        defineExtension('draft-facet-providers', {
          facetProviders: [
            documentText.compute((state) => state.text.string([]), {
              dependencies: ['document'],
            }),
            mainText.compute((state) => state.text.string([]), {
              dependencies: [{ kind: 'document' }],
            }),
            sidebarText.compute(
              (state) => NodeApi.string(state.root('sidebar')[0]),
              { dependencies: [{ kind: 'document', root: 'sidebar' }] }
            ),
            selectionOffset.compute(
              (state) => {
                const selection = state.selection();

                return selection?.anchor.offset ?? -1;
              },
              { dependencies: ['selection'] }
            ),
            counterValue.compute((state) => state.getField(counter), {
              dependencies: [counter],
            }),
            doubledCounter.compute(
              (state) => (state.facet(counterValue)[0] ?? 0) * 2,
              { dependencies: [counterValue] }
            ),
            schemaKind.compute(
              (state) =>
                state.schema.element('quote')?.behavior.voidKind ?? 'regular',
              { dependencies: ['schema'] }
            ),
            wholeState.compute((state) => {
              const selection = state.selection();
              const offset = selection?.anchor.offset ?? -1;

              return `${state.text.string([])}:${offset}:${state.getField(counter)}`;
            }),
          ],
          stateFields: [counter],
        }),
        schemaSlot.of(schemaMode()),
      ] as const,
      initialValue: {
        children: [paragraph('a')],
        roots: { sidebar: [paragraph('side')] },
      },
    });

    const initialMain = editor.read.facet(mainText);
    const initialSidebar = editor.read.facet(sidebarText);
    const initialSchema = editor.read.facet(schemaKind);

    assert.deepEqual(editor.read.facet(documentText), ['a']);
    assert.deepEqual(editor.read.facet(selectionOffset), [-1]);
    assert.deepEqual(editor.read.facet(doubledCounter), [0]);
    assert.deepEqual(editor.read.facet(wholeState), ['a:-1:0']);

    editor.update((tx) => {
      assert.equal(tx.facet(mainText), initialMain);
      assert.equal(tx.facet(sidebarText), initialSidebar);

      tx.text.insert('!', { at: { offset: 1, path: [0, 0] } });
      assert.deepEqual(tx.facet(documentText), ['a!']);
      assert.deepEqual(tx.facet(mainText), ['a!']);
      assert.equal(tx.facet(sidebarText), initialSidebar);
      assert.deepEqual(tx.facet(wholeState), ['a!:-1:0']);

      const mainAfterInsert = tx.facet(mainText);

      tx.roots.replace('sidebar', [paragraph('aside')]);
      assert.deepEqual(tx.facet(documentText), ['a!']);
      assert.equal(tx.facet(mainText), mainAfterInsert);
      assert.deepEqual(tx.facet(sidebarText), ['aside']);

      tx.selection.set({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      assert.deepEqual(tx.facet(selectionOffset), [2]);
      assert.deepEqual(tx.facet(wholeState), ['a!:2:0']);

      tx.setField(counter, 3);
      assert.deepEqual(tx.facet(counterValue), [3]);
      assert.deepEqual(tx.facet(doubledCounter), [6]);
      assert.deepEqual(tx.facet(wholeState), ['a!:2:3']);

      tx.extensions.reconfigure(schemaSlot, schemaMode('block'));
      assert.equal(tx.facet(schemaKind), initialSchema);
    });

    assert.deepEqual(editor.read.facet(schemaKind), ['block']);
  });

  it('does not leak speculative or rolled-back facet cache values', () => {
    const text = defineFacet<string>({ key: 'isolated-draft-text' });
    let computes = 0;
    const editor = createEditor({
      extensions: [
        defineExtension('isolated-draft-facet', {
          facetProviders: [
            text.compute(
              (state) => {
                computes += 1;
                return state.text.string([]);
              },
              { dependencies: ['document'] }
            ),
          ],
        }),
      ],
      initialValue: [paragraph('a')],
    });
    const committed = editor.read.facet(text);
    const spec = editor.read((state) =>
      state.transaction((tx) => {
        assert.equal(tx.facet(text), committed);
        tx.text.insert('!', { at: { offset: 1, path: [0, 0] } });
        assert.deepEqual(tx.facet(text), ['a!']);
      })
    );

    assert.equal(spec.kind, 'transaction');
    assert.equal(editor.read.facet(text), committed);

    assert.throws(() => {
      editor.update((tx) => {
        assert.equal(tx.facet(text), committed);
        tx.text.insert('?', { at: { offset: 1, path: [0, 0] } });
        assert.deepEqual(tx.facet(text), ['a?']);
        throw new Error('abort draft');
      });
    }, /abort draft/);

    assert.equal(editor.read.facet(text), committed);
    assert.equal(computes, 3);
  });
});
