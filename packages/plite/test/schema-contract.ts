import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorExtension,
  type EditorElementSpec,
  elementProperty,
} from '../src';

describe('editor schema', () => {
  it('owns element predicates for app-defined specs', () => {
    const editor = createEditor();
    const cleanup = editor.extend(
      defineEditorExtension({
        elements: [
          { inline: true, type: 'link' },
          { type: 'image', void: 'block' },
          { selectable: false, type: 'badge' },
          { readOnly: true, type: 'readonly' },
          { type: 'mention', void: 'markable-inline' },
        ],
        name: 'schema-contract',
      })
    );

    assert.equal(
      editor.read((state) =>
        state.schema.isInline({ type: 'link', children: [] })
      ),
      true
    );
    assert.equal(
      editor.read((state) =>
        state.schema.isVoid({ type: 'image', children: [] })
      ),
      true
    );
    assert.equal(
      editor.read((state) =>
        state.schema.isSelectable({ type: 'badge', children: [] })
      ),
      false
    );
    assert.equal(
      editor.read((state) =>
        state.schema.isReadOnly({ type: 'readonly', children: [] })
      ),
      true
    );
    assert.equal(
      editor.read((state) =>
        state.schema.markableVoid({
          type: 'mention',
          children: [{ text: '' }],
        })
      ),
      true
    );

    cleanup();

    assert.equal(
      editor.read((state) =>
        state.schema.isVoid({ type: 'image', children: [] })
      ),
      false
    );
  });

  it('registers element specs through extensions', () => {
    const editor = createEditor();
    const cleanup = editor.extend(
      defineEditorExtension({
        elements: [{ type: 'embed', void: 'block' }],
        name: 'embed',
      })
    );

    assert.equal(
      editor.read((state) =>
        state.schema.isVoid({ type: 'embed', children: [] })
      ),
      true
    );
    assert.deepEqual(
      editor.read((state) => state.schema.getElementSpec('embed')),
      {
        type: 'embed',
        void: 'block',
      }
    );

    cleanup();

    assert.equal(
      editor.read((state) => state.schema.getElementSpec('embed')),
      null
    );
  });

  it('does not normalize boolean shorthand as a void kind', () => {
    const editor = createEditor();
    const cleanup = editor.extend(
      defineEditorExtension({
        elements: [
          {
            type: 'boolean-void-flag',
            void: true,
          } as unknown as EditorElementSpec,
        ],
        name: 'boolean-void-flag',
      })
    );

    assert.equal(
      editor.read((state) =>
        state.schema.isVoid({ type: 'boolean-void-flag', children: [] })
      ),
      false
    );

    cleanup();
  });

  it('rejects duplicate element specs', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [{ type: 'image', void: 'block' }],
        name: 'image',
      })
    );

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            elements: [{ inline: true, type: 'image' }],
            name: 'other-image',
          })
        ),
      /element spec "image".*conflicts/
    );
  });

  it('rejects reserved extension-owned element property names', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            elements: [
              {
                properties: {
                  type: elementProperty.string(),
                },
                type: 'bad-cell',
              },
            ],
            name: 'bad-properties',
          })
        ),
      /reserved element property "type"/
    );
  });

  it('exposes schema through read and update views', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [{ type: 'mention', void: 'markable-inline' }],
        name: 'mention',
      })
    );

    const readInline = editor.read((state) =>
      state.schema.isInline({ type: 'mention', children: [{ text: '' }] })
    );
    let txMarkable = false;

    editor.update((tx) => {
      txMarkable = tx.schema.markableVoid({
        type: 'mention',
        children: [{ text: '' }],
      });
    });

    assert.equal(readInline, true);
    assert.equal(txMarkable, true);
  });

  it('resolves element behavior policy from specs', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [
          {
            atom: true,
            isolating: true,
            keyboardSelectable: true,
            type: 'mention-card',
          },
          {
            type: 'editable-embed',
            void: 'editable-island',
          },
        ],
        name: 'element-behavior',
      })
    );

    const atom = { type: 'mention-card', children: [{ text: 'label' }] };
    const island = { type: 'editable-embed', children: [{ text: 'inside' }] };

    assert.equal(
      editor.read((state) => state.schema.isAtom(atom)),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.isIsolating(atom)),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.isKeyboardSelectable(atom)),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.isEditableIsland(island)),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.isAtom(island)),
      false
    );
  });

  it('reads extension-owned element property defaults without mutating JSON values', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [
          {
            properties: {
              colSpan: elementProperty.number({
                default: 1,
                equals: (left, right) => Math.trunc(left) === Math.trunc(right),
              }),
              locked: elementProperty.boolean({ default: false }),
              role: elementProperty.string({ default: 'cell' }),
            },
            type: 'table-cell',
          },
        ],
        name: 'table-properties',
      })
    );
    const cell = {
      type: 'table-cell',
      children: [{ text: '' }],
    };

    assert.equal(
      editor.read((state) => state.schema.getElementProperty(cell, 'colSpan')),
      1
    );
    assert.equal(
      editor.read((state) => state.schema.getElementProperty(cell, 'locked')),
      false
    );
    assert.equal(
      editor.read((state) => state.schema.getElementProperty(cell, 'role')),
      'cell'
    );
    assert.equal(
      editor.read((state) =>
        state.schema.isElementPropertyEqual('table-cell', 'colSpan', 1.2, 1.8)
      ),
      true
    );
    assert.deepEqual(cell, {
      type: 'table-cell',
      children: [{ text: '' }],
    });
  });

  it('resolves property defaults through matched spec overlays', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [
          {
            properties: {
              colSpan: elementProperty.number({ default: 1 }),
            },
            type: 'table-cell',
          },
          {
            match: (element) =>
              (element as typeof element & { variant?: string }).variant ===
              'wide',
            properties: {
              colSpan: elementProperty.number({ default: 2 }),
            },
            type: 'wide-table-cell',
          },
        ],
        name: 'table-property-overlays',
      })
    );

    assert.equal(
      editor.read((state) =>
        state.schema.getElementProperty(
          { type: 'table-cell', variant: 'wide', children: [{ text: '' }] },
          'colSpan'
        )
      ),
      2
    );
  });
});
