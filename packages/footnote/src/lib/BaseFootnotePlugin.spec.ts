import { createBaseEditor, defineBasePlugin } from '@platejs/core';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteInputPlugin,
  BaseFootnotePlugin,
} from './BaseFootnotePlugin';
import {
  DocumentChange,
  createEditor,
  schema,
  type Selection,
  type Value,
} from '@platejs/plite';

describe('BaseFootnotePlugins', () => {
  it('declares the input as an exact required Base dependency', () => {
    expect(BaseFootnotePlugin.dependencies).toEqual([BaseFootnoteInputPlugin]);
  });

  it('rejects a disabled required footnote-input dependency', () => {
    expect(() =>
      createBaseEditor({
        plugins: [
          BaseFootnotePlugin,
          BaseFootnoteInputPlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(
      /footnote.*disabled.*footnoteInput|footnoteInput.*disabled.*footnote/i
    );
  });

  it('configures footnote reference as an inline void element', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin],
    });
    const state = editor.plugin(BaseFootnotePlugin).store.get();

    expect(
      editor.read.schema.element(BaseFootnotePlugin)?.behavior.inline
    ).toBe(true);
    expect(editor.read.schema.element(BaseFootnotePlugin)?.behavior.void).toBe(
      true
    );
    expect(
      editor.read.schema.element(BaseFootnotePlugin)?.behavior.voidKind
    ).toBe('inline');
    expect(state.trigger).toBe('^');
    expect(state.triggerPreviousCharPattern?.test('[')).toBe(true);
    expect(state.triggerPreviousCharPattern?.test('x')).toBe(false);
    expect(state.createComboboxInput?.('^')).toEqual({
      children: [{ text: '' }],
      type: 'footnoteInput',
    });
    expect(
      editor.read.schema.element(BaseFootnoteInputPlugin)?.behavior
    ).toMatchObject({
      inline: true,
      void: true,
      voidKind: 'inline',
    });
    expect(
      editor.read.schema.getElementBehavior({
        children: [{ text: '' }],
        type: 'footnoteReference',
      })
    ).toMatchObject({ atom: true, inline: true, void: true });
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            type: 'footnoteReference',
          },
        ],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
  });

  it('creates transient inputs with the configured schema type', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin],
      schema: {
        overrides: [
          schema.override(BaseFootnoteInputPlugin, {
            element: { type: 'customFootnoteInput' },
          }),
        ],
      },
    });

    expect(
      editor.plugin(BaseFootnotePlugin).store.get('createComboboxInput')('^')
    ).toMatchObject({ type: 'customFootnoteInput' });
  });

  it('configures footnote definition as a block element', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnoteDefinitionPlugin],
    });
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.content
        ?.allowsText
    ).toBe(false);
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.content?.min
    ).toBe(1);
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.behavior.inline
    ).toBe(false);
    expect(editor.read.schema.create(BaseFootnoteDefinitionPlugin)).toEqual({
      children: [{ children: [{ text: '' }], type: 'paragraph' }],
      type: 'footnoteDefinition',
    });
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.groups
    ).toContain('block');
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'paragraph' }],
            type: 'footnoteDefinition',
          },
        ],
      })
    ).not.toThrow();
  });

  it('provides footnote api and insert / navigation transforms on the editor', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
    });
    const api = editor.read.footnote;
    const footnote = editor.update.footnote;

    expect(api).toBeDefined();
    expect(typeof api.nextId).toBe('function');
    expect(typeof api.definition).toBe('function');
    expect(typeof api.definitions).toBe('function');
    expect(typeof api.duplicateDefinitions).toBe('function');
    expect(typeof api.references).toBe('function');
    expect(typeof api.identifiers).toBe('function');
    expect(typeof api.isDuplicateDefinition).toBe('function');
    expect(typeof api.isResolved).toBe('function');
    expect(typeof api.hasDuplicateDefinitions).toBe('function');
    expect(typeof api.duplicateIdentifiers).toBe('function');

    expect(typeof editor.update.footnote.insert).toBe('function');
    expect(typeof footnote.createDefinition).toBe('function');
    expect(typeof footnote.focusDefinition).toBe('function');
    expect(typeof footnote.focusReference).toBe('function');
    expect(typeof footnote.normalizeDuplicateDefinition).toBe('function');
  });

  it('deleteBackward removes the adjacent footnote atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next footnote atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('typing "^" after "[" inserts a footnote combobox input', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '[' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.insert('^');

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: '[' },
          {
            children: [{ text: '' }],
            type: 'footnoteInput',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
  });
});

describe('BaseFootnotePlugin read', () => {
  it('stays current across text edits and footnote insertion', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [1, 0, 0] },
        focus: { offset: 4, path: [1, 0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: '1' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
        {
          children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.read;

    expect(footnote.definition({ identifier: '1' })).toBeDefined();
    expect(footnote.definitions({ identifier: '1' })).toHaveLength(1);
    expect(footnote.isResolved({ identifier: '1' })).toBe(true);
    expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(false);
    expect(footnote.duplicateIdentifiers()).toEqual([]);
    expect(footnote.references({ identifier: '1' })).toHaveLength(1);
    expect(footnote.definitionText({ identifier: '1' })).toBe('body');
    expect(footnote.nextId()).toBe('2');

    editor.update.text.insert('!');

    expect(footnote.definitionText({ identifier: '1' })).toBe('body!');

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
    editor.update.footnote.insert({
      focusDefinition: false,
      identifier: '2',
    });

    expect(footnote.nextId()).toBe('3');
  });

  it('detects duplicate definitions without scanning on every lookup', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [
        {
          children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: 'paragraph' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.read;

    expect(footnote.isResolved({ identifier: '1' })).toBe(true);
    expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(true);
    expect(footnote.duplicateIdentifiers()).toEqual(['1']);
    expect(footnote.definitions({ identifier: '1' })).toHaveLength(2);
    expect(footnote.duplicateDefinitions({ identifier: '1' })).toHaveLength(1);
    expect(footnote.isDuplicateDefinition({ path: [0] })).toBe(false);
    expect(footnote.isDuplicateDefinition({ path: [1] })).toBe(true);
  });

  it('invalidates for footnotes nested in inserted and removed blocks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    expect(editor.read.footnote.nextId()).toBe('1');

    editor.update.nodes.insert(
      {
        children: [
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
        ],
        type: 'paragraph',
      },
      { at: [1] }
    );

    expect(editor.read.footnote.nextId()).toBe('2');

    editor.update.nodes.remove({ at: [1] });

    expect(editor.read.footnote.nextId()).toBe('1');
  });

  it('can renumber a later duplicate definition without touching the canonical first definition', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [
        {
          children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: 'paragraph' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.read;

    expect(
      editor.update.footnote.normalizeDuplicateDefinition({ path: [1] })
    ).toBe('2');
    expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(false);
    expect(footnote.duplicateIdentifiers()).toEqual([]);
    expect(footnote.definition({ identifier: '1' })).toMatchObject([
      { identifier: '1', type: 'footnoteDefinition' },
      [0],
    ]);
    expect(footnote.definition({ identifier: '2' })).toMatchObject([
      { identifier: '2', type: 'footnoteDefinition' },
      [1],
    ]);
    expect(footnote.isDuplicateDefinition({ path: [1] })).toBe(false);
  });

  it('invalidates for a classification-free identifier change', () => {
    const value = [
      {
        children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ] as const;
    const plugins = [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const;
    const source = createBaseEditor({
      plugins,
      initialValue: value,
    });

    source.update.nodes.set({ identifier: '2' }, { at: [0] });

    const change = DocumentChange.fromJSON(
      source.read.lastCommit()!.changes.toJSON()
    );
    const replay = createBaseEditor({
      plugins,
      initialValue: value,
    });

    expect(replay.read.footnote.definition({ identifier: '1' })).toBeDefined();
    expect(change.primaryClassification).toBeNull();
    replay.update((tx) => tx.changes.apply(change));

    expect(
      replay.read.footnote.definition({ identifier: '1' })
    ).toBeUndefined();
    expect(replay.read.footnote.definition({ identifier: '2' })).toBeDefined();
  });
});

describe('BaseFootnotePlugin updates', () => {
  it('creates one definition and reuses it on later requests', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    expect(
      editor.update.footnote.createDefinition({
        focus: false,
        identifier: '1',
      })
    ).toEqual([1]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    expect(
      editor.update.footnote.createDefinition({ identifier: '1' })
    ).toEqual([1]);
    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('preserves block fragments as definition children', () => {
    const TestFootnoteBlockPlugin = defineBasePlugin('testFootnoteBlock', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [
        BaseFootnotePlugin,
        BaseFootnoteDefinitionPlugin,
        TestFootnoteBlockPlugin,
      ] as const,
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    editor.update.footnote.createDefinition({
      focus: false,
      fragment: [
        {
          children: [{ text: 'selected block' }],
          type: 'testFootnoteBlock',
        },
      ],
      identifier: '3',
    });

    expect(editor.read.nodes.get([1])?.[0]).toMatchObject({
      children: [
        {
          children: [{ text: 'selected block' }],
          type: 'testFootnoteBlock',
        },
      ],
      identifier: '3',
      type: 'footnoteDefinition',
    });
    expect(() =>
      editor.read.schema.assertDocument(editor.read.value())
    ).not.toThrow();
  });

  it('uses selected content as the initial definition body', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'hello world' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.footnote.insert();

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: 'hello ' },
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
      {
        children: [{ children: [{ text: 'world' }], type: 'paragraph' }],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('inserts at an explicit target without an active selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    editor.update.footnote.insert({ focusDefinition: false }, { at: [0, 0] });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
          { text: 'hello' },
        ],
        type: 'paragraph',
      },
      {
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);
  });

  it('removes a matching trigger in the insertion transaction', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'abc[' }], type: 'paragraph' }],
    });

    editor.update.footnote.insert({
      focusDefinition: false,
      trigger: '[',
    });

    expect(editor.read.text.string([0])).toBe('abc');
    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      identifier: '1',
      type: 'footnoteReference',
    });
  });

  it('skips used numeric identifiers when inserting', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'x' }], type: 'paragraph' },
        {
          children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'three' }], type: 'paragraph' }],
          identifier: '3',
          type: 'footnoteDefinition',
        },
      ],
    });

    editor.update.footnote.insert({ focusDefinition: false });

    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      identifier: '2',
      type: 'footnoteReference',
    });
    expect(editor.read.nodes.get([3])?.[0]).toMatchObject({
      identifier: '2',
      type: 'footnoteDefinition',
    });
  });

  it('reuses an existing definition for an explicit identifier', () => {
    const editor = createBaseEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'x' }], type: 'paragraph' },
        {
          children: [{ children: [{ text: 'existing' }], type: 'paragraph' }],
          identifier: '7',
          type: 'footnoteDefinition',
        },
      ],
    });

    editor.update.footnote.insert({ identifier: '7' });

    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });
});

{
  const createFootnoteRuntimeEditor = ({
    selection,
    value,
  }: {
    selection?: Selection;
    value: Value;
  }) =>
    createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection,
      initialValue: value,
    });

  describe('BaseFootnotePlugin runtime', () => {
    it('exposes footnote registry api from the runtime document', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [
              {
                children: [{ text: '' }],
                identifier: '1',
                type: 'footnoteReference',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
            identifier: '1',
            type: 'footnoteDefinition',
          },
          {
            children: [
              { children: [{ text: 'duplicate' }], type: 'paragraph' },
            ],
            identifier: '1',
            type: 'footnoteDefinition',
          },
        ],
      });
      const { footnote } = editor.read;

      expect(footnote.definition({ identifier: '1' })?.[1]).toEqual([1]);
      expect(footnote.definitions({ identifier: '1' })).toHaveLength(2);
      expect(footnote.references({ identifier: '1' })).toHaveLength(1);
      expect(footnote.definitionText({ identifier: '1' })).toBe('body');
      expect(footnote.isResolved({ identifier: '1' })).toBe(true);
      expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(true);
      expect(footnote.duplicateDefinitions({ identifier: '1' })).toHaveLength(
        1
      );
      expect(footnote.duplicateIdentifiers()).toEqual(['1']);
      expect(footnote.identifiers()).toEqual(['1']);
      expect(footnote.nextId()).toBe('2');
    });

    it('renumbers duplicate definitions through the runtime transaction group', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
            identifier: '1',
            type: 'footnoteDefinition',
          },
          {
            children: [
              { children: [{ text: 'duplicate' }], type: 'paragraph' },
            ],
            identifier: '1',
            type: 'footnoteDefinition',
          },
        ],
      });
      const normalizedIdentifier =
        editor.update.footnote.normalizeDuplicateDefinition({ path: [1] });

      expect(String(normalizedIdentifier)).toBe('2');

      const { footnote } = editor.read;

      expect(footnote.hasDuplicateDefinitions({ identifier: '1' })).toBe(false);
      expect(footnote.definition({ identifier: '2' })?.[1]).toEqual([1]);
    });

    it('does not renumber definitions without an identifier', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
            type: 'footnoteDefinition',
          },
          {
            children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
            type: 'footnoteDefinition',
          },
        ],
      });

      expect(
        editor.update.footnote.normalizeDuplicateDefinition({ path: [1] })
      ).toBe(false);
      expect(editor.read.nodes.get([1])?.[0]).not.toHaveProperty('identifier');
    });

    it('renumbers a definition inserted earlier in the same transaction', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
            identifier: '1',
            type: 'footnoteDefinition',
          },
        ],
      });

      editor.update((tx) => {
        tx.nodes.insert(
          {
            children: [
              { children: [{ text: 'duplicate' }], type: 'paragraph' },
            ],
            identifier: '1',
            type: 'footnoteDefinition',
          },
          { at: [1] }
        );
        tx.footnote.normalizeDuplicateDefinition({ path: [1] });
      });

      expect(editor.read.nodes.get([1])?.[0]).toMatchObject({
        identifier: '2',
      });
    });

    it('inserts a footnote reference and definition through the runtime transaction group', () => {
      const editor = createFootnoteRuntimeEditor({
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        value: [{ children: [{ text: 'hi' }], type: 'paragraph' }],
      });

      editor.update.footnote.insert({ focusDefinition: false });

      expect(editor.read.value().children).toEqual([
        {
          children: [
            { text: 'hi' },
            {
              children: [{ text: '' }],
              identifier: '1',
              type: 'footnoteReference',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
        {
          children: [{ children: [{ text: '' }], type: 'paragraph' }],
          identifier: '1',
          type: 'footnoteDefinition',
        },
      ]);
      expect(editor.read.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      });
    });

    it('navigates between definitions and references through runtime transaction groups', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [
              { text: 'a' },
              {
                children: [{ text: '' }],
                identifier: '1',
                type: 'footnoteReference',
              },
              { text: 'b' },
            ],
            type: 'paragraph',
          },
          {
            children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
            identifier: '1',
            type: 'footnoteDefinition',
          },
        ],
      });
      const didFocusDefinition = editor.update.footnote.focusDefinition({
        identifier: '1',
      });

      expect(didFocusDefinition).toBe(true);
      expect(editor.read.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [1, 0, 0] },
        focus: { offset: 0, path: [1, 0, 0] },
      });

      const didFocusReference = editor.update.footnote.focusReference({
        identifier: '1',
      });

      expect(didFocusReference).toBe(true);
      expect(editor.read.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      });
    });
  });
}
