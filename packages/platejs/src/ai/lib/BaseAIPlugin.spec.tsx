/** @jsx jsxt */

import { jsxt, type TestEditor } from '#platejs-test-internal';

import {
  BaseParagraphPlugin,
  createEditor as createProductEditor,
  defineBasePlugin,
  type Descendant,
  type NodeEntry,
  property,
  schema,
} from '../../core';
import {
  BaseSuggestionPlugin,
  SUGGESTION_TRANSIENT_KEY,
} from '../../features/suggestion';
import { AIChatPlugin } from '../react/AIChatPlugin';
import { AI_PREVIEW_KEY, BaseAIPlugin } from './BaseAIPlugin';

{
  const createEditor = () =>
    createProductEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

  describe('BaseAIPlugin AI batches', () => {
    it('tags a merged AI write with state tracked by history', () => {
      const editor = createEditor();

      editor.update({ history: 'merge' }, (tx) => {
        tx.ai.markBatch();
        tx.text.insert('ai');
      });

      expect(editor.read.text.string([])).toBe('ai');
      expect(editor.read.history.undos()).toHaveLength(1);
    });

    it('starts a fresh batch when split is true', () => {
      const editor = createEditor();

      editor.update.text.insert('before');
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.ai.markBatch();
        tx.text.insert(' ai');
      });

      expect(editor.read.history.undos()).toHaveLength(2);

      editor.update.history.undo();

      expect(editor.read.text.string([])).toBe('before');
    });

    it('records an AI batch even when the callback has no document writes', () => {
      const editor = createEditor();

      editor.update({ history: 'merge' }, (tx) => {
        tx.ai.markBatch();
      });

      expect(editor.read.history.undos()).toHaveLength(1);
    });

    it('merges consecutive AI chunks into one undo batch', () => {
      const editor = createEditor();

      editor.update({ history: 'new-batch' }, (tx) => {
        tx.ai.markBatch();
        tx.nodes.insert({ ai: true, text: 'first' }, { at: [0, 1] });
      });
      editor.update({ history: 'merge' }, (tx) => {
        tx.ai.markBatch();
        tx.nodes.insert({ ai: true, text: ' second' }, { at: [0, 1] });
      });

      expect(editor.read.text.string([])).toBe('first second');
      expect(editor.read.history.undos()).toHaveLength(1);

      editor.update.history.undo();

      expect(editor.read.text.string([])).toBe('');
    });
  });
}

{
  const rangeEditor = createProductEditor({ plugins: [BaseAIPlugin] });
  const { findTextRangeInBlock } = rangeEditor.plugin(BaseAIPlugin).api;
  const block = (children: Descendant[]): NodeEntry => [
    { children, type: 'paragraph' },
    [0],
  ];

  describe('findTextRangeInBlock', () => {
    it('finds text inside a nested inline', () => {
      expect(
        findTextRangeInBlock({
          block: block([
            { text: 'a' },
            { children: [{ text: 'test' }], type: 'link' },
          ]),
          findText: 'test',
        })
      ).toEqual({
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      });
    });

    it('finds text spanning multiple leaves', () => {
      expect(
        findTextRangeInBlock({
          block: block([
            { text: 'prefix ' },
            { bold: true, text: 't' },
            { italic: true, text: 'e' },
            { text: 's' },
            { text: 't' },
          ]),
          findText: 'test',
        })
      ).toEqual({
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 1, path: [0, 4] },
      });
    });

    it('uses a fuzzy match for a small typo', () => {
      expect(
        findTextRangeInBlock({
          block: block([{ text: 'The quik brown fox' }]),
          findText: 'quick',
        })
      ).toEqual({
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 8, path: [0, 0] },
      });
    });

    it('falls back to the longest prefix', () => {
      expect(
        findTextRangeInBlock({
          block: block([{ text: 'This is a tes' }]),
          findText: 'test',
        })
      ).toEqual({
        anchor: { offset: 10, path: [0, 0] },
        focus: { offset: 13, path: [0, 0] },
      });
    });

    it('returns null without a useful match', () => {
      expect(
        findTextRangeInBlock({
          block: block([{ text: 'abc' }]),
          findText: 'xyz',
        })
      ).toBeNull();
    });
  });
}

{
  jsxt;

  const createEditor = (input: TestEditor) =>
    createProductEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

  describe('insertAINodes', () => {
    it('does nothing without a selection or explicit target', () => {
      const editor = createProductEditor({
        plugins: [BaseParagraphPlugin, BaseAIPlugin],
        initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      });
      const before = structuredClone(editor.read.children());

      editor.update((tx) => tx.ai.insertNodes([{ text: ' AI' }]));

      expect(editor.read.children()).toEqual(before);
      expect(editor.read.selection()).toBeNull();
    });

    it('clones inserted nodes with ai metadata and collapses at the end', () => {
      const input = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;
      const editor = createEditor(input);

      editor.update((tx) => tx.ai.insertNodes([{ text: ' AI' }]));

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'one' }, { ai: true, text: ' AI' }],
          type: 'paragraph',
        },
      ]);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 3, path: [0, 1] },
        focus: { offset: 3, path: [0, 1] },
      });
    });

    it('uses the explicit target instead of the current selection', () => {
      const input = (
        <editor>
          <hp>first</hp>
          <hp>
            second
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;
      const editor = createEditor(input);

      editor.update((tx) =>
        tx.ai.insertNodes([{ text: ' AI' }], { target: [0, 0] })
      );

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'first' }, { ai: true, text: ' AI' }],
          type: 'paragraph',
        },
        {
          children: [{ text: 'second' }],
          type: 'paragraph',
        },
      ]);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 3, path: [0, 1] },
        focus: { offset: 3, path: [0, 1] },
      });
    });

    it('uses selection changes from the active transaction', () => {
      const input = (
        <editor>
          <hp>first</hp>
          <hp>
            second
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;
      const editor = createEditor(input);

      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { offset: 5, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        });
        tx.ai.insertNodes([{ text: ' AI' }]);
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'first' }, { ai: true, text: ' AI' }],
          type: 'paragraph',
        },
        {
          children: [{ text: 'second' }],
          type: 'paragraph',
        },
      ]);
    });
  });
}

{
  const createParagraph = (
    text: string,
    {
      element = {},
      text: textProps = {},
    }: {
      element?: Record<string, unknown>;
      text?: Record<string, unknown>;
    } = {}
  ) => ({
    ...element,
    children: [{ text, ...textProps }],
    type: 'paragraph' as const,
  });

  const createEditor = () =>
    createProductEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        AIChatPlugin.configure({ initialState: { open: true } }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [createParagraph('start'), createParagraph('untouched')],
    });

  const InlineFixturePlugin = defineBasePlugin('inlineFixture', {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
    },
  });

  const createPreviewHarness = () => {
    const editor = createEditor();

    return {
      editor,
      installPreview: ({ selection = editor.read.selection() } = {}) => {
        editor.update({ history: 'skip' }, (tx) => {
          tx.nodes.replaceChildren(
            [
              createParagraph('preview', {
                element: { [AI_PREVIEW_KEY]: true },
                text: { ai: true },
              }),
              { children: [{ text: '' }], type: 'aiChat' },
              createParagraph('untouched'),
            ],
            { at: [], count: tx.children().length, index: 0 }
          );

          if (selection) {
            tx.selection.set(selection);
          } else {
            tx.selection.set(null);
          }
        });
      },
    };
  };

  describe('ai preview transforms', () => {
    it('canonicalizes false AI marks to the absent default', () => {
      const editor = createProductEditor({
        plugins: [BaseParagraphPlugin, BaseAIPlugin],
      });

      expect(
        editor.read.schema.fitDocument({
          children: [createParagraph('plain', { text: { ai: false } })],
        })
      ).toEqual({ children: [createParagraph('plain')] });
    });

    it('targets AI marks to text parents and preview state to blocks', () => {
      const editor = createProductEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseAIPlugin,
          AIChatPlugin,
          InlineFixturePlugin,
        ],
      });
      expect(
        editor.read.schema.property({
          key: 'ai',
          placement: 'text',
          type: 'paragraph',
        })
      ).not.toBeNull();
      expect(
        editor.read.schema.property({
          key: 'ai',
          placement: 'text',
          type: 'missing',
        })
      ).toBeNull();
      expect(
        editor.read.schema.property({
          key: AI_PREVIEW_KEY,
          placement: 'element',
          type: 'paragraph',
        })?.value.kind
      ).toBe('boolean');
      expect(
        editor.read.schema.property({
          key: AI_PREVIEW_KEY,
          placement: 'element',
          type: 'inlineFixture',
        })
      ).toBeNull();
      expect(
        editor.read.schema.property({
          key: AI_PREVIEW_KEY,
          placement: 'element',
          type: 'paragraph',
        })?.role
      ).toBe('content');
      expect(
        editor.read.schema.property({
          key: 'ai',
          placement: 'text',
          type: 'paragraph',
        })
      ).toMatchObject({
        lifecycle: {
          split: 'preserve',
          typeChange: 'preserve-if-allowed',
        },
        merge: 'replace',
      });
    });

    it('captures once and keeps the original rollback point', () => {
      const { editor, installPreview } = createPreviewHarness();
      const initialValue = structuredClone(editor.read.children());
      const initialSelection = structuredClone(editor.read.selection());

      expect(
        editor.plugin(BaseAIPlugin).update.beginPreview({
          originalBlocks: [structuredClone(initialValue[0])],
        })
      ).toBe(true);

      installPreview({
        selection: {
          anchor: { offset: 7, path: [0, 0] },
          focus: { offset: 7, path: [0, 0] },
        },
      });

      expect(
        editor.plugin(BaseAIPlugin).update.beginPreview({ originalBlocks: [] })
      ).toBe(false);
      expect(editor.plugin(BaseAIPlugin).update.cancelPreview()).toBe(true);
      expect(editor.read.children()).toEqual(initialValue);
      expect(editor.read.selection()).toEqual(initialSelection);
    });

    it('does nothing when no preview exists', () => {
      const editor = createEditor();

      expect(editor.plugin(BaseAIPlugin).read.hasPreview()).toBe(false);
      expect(editor.plugin(BaseAIPlugin).update.cancelPreview()).toBe(false);
      expect(editor.plugin(BaseAIPlugin).update.discardPreview()).toBe(false);
      expect(editor.plugin(BaseAIPlugin).update.acceptPreview()).toBe(false);
    });

    it('discards bookkeeping without restoring content', () => {
      const { editor, installPreview } = createPreviewHarness();

      editor.plugin(BaseAIPlugin).update.beginPreview();
      installPreview({ selection: null });

      expect(editor.plugin(BaseAIPlugin).update.discardPreview()).toBe(true);
      expect(editor.plugin(BaseAIPlugin).read.hasPreview()).toBe(false);
      expect(editor.read.children()[0]).toEqual(
        createParagraph('preview', {
          element: { [AI_PREVIEW_KEY]: true },
          text: { ai: true },
        })
      );
      expect(editor.read.selection()).toBeNull();
    });

    it('restores a null snapshot selection', () => {
      const { editor, installPreview } = createPreviewHarness();

      editor.update.selection.set(null);
      editor.plugin(BaseAIPlugin).update.beginPreview({
        originalBlocks: [structuredClone(editor.read.children()[0])],
      });
      installPreview({
        selection: {
          anchor: { offset: 7, path: [0, 0] },
          focus: { offset: 7, path: [0, 0] },
        },
      });

      expect(editor.plugin(BaseAIPlugin).update.cancelPreview()).toBe(true);
      expect(editor.read.selection()).toBeNull();
    });

    it('accepts preview as one undoable batch and clears preview state', () => {
      const { editor, installPreview } = createPreviewHarness();
      const initialValue = structuredClone(editor.read.children());
      const initialSelection = structuredClone(editor.read.selection());

      editor.plugin(BaseAIPlugin).update.beginPreview({
        originalBlocks: [structuredClone(initialValue[0])],
      });
      installPreview();

      expect(editor.plugin(BaseAIPlugin).update.acceptPreview()).toBe(true);
      expect(editor.read.children()).toEqual([
        createParagraph('preview'),
        createParagraph('untouched'),
      ]);
      expect(editor.plugin(BaseAIPlugin).read.hasPreview()).toBe(false);

      editor.update.history.undo();

      expect(editor.read.children()).toEqual(initialValue);
      expect(editor.read.selection()).toEqual(initialSelection);
    });

    it('registers the preview lifecycle on BaseAIPlugin', () => {
      const editor = createEditor();
      const ai = editor.plugin(BaseAIPlugin);

      expect(ai.read.hasPreview()).toBe(false);
      expect(ai.update.beginPreview({ originalBlocks: [] })).toBe(true);
      expect(ai.update.discardPreview()).toBe(true);
      expect(ai.read.hasPreview()).toBe(false);
    });
  });
}

{
  const BaseBoldPlugin = defineBasePlugin('bold', {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('removeAIMarks', () => {
    it('unsets only ai marks and leaves other marks alone', () => {
      const editor = createProductEditor({
        plugins: [BaseParagraphPlugin, BaseBoldPlugin, BaseAIPlugin],
        initialValue: [
          {
            type: 'paragraph',
            children: [
              { ai: true, bold: true, text: 'one' },
              { bold: true, text: ' two' },
            ],
          },
        ],
      });

      editor.update((tx) => tx.ai.removeMarks());

      expect(editor.read.children()).toEqual([
        {
          children: [{ bold: true, text: 'one two' }],
          type: 'paragraph',
        },
      ]);
    });

    it('respects the at filter', () => {
      const editor = createProductEditor({
        plugins: [BaseParagraphPlugin, BaseAIPlugin],
        initialValue: [
          { type: 'paragraph', children: [{ ai: true, text: 'one' }] },
          { type: 'paragraph', children: [{ ai: true, text: 'two' }] },
        ],
      });

      editor.update((tx) => tx.ai.removeMarks({ at: [1] }));

      expect(editor.read.children()).toEqual([
        { type: 'paragraph', children: [{ ai: true, text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ]);
    });
  });
}

// isolates the merged behavior family.
{
  describe('removeAINodes', () => {
    it('removes only text nodes marked with ai', () => {
      const editor = createProductEditor({
        plugins: [BaseParagraphPlugin, BaseAIPlugin],
        initialValue: [
          {
            type: 'paragraph',
            children: [{ ai: true, text: 'one' }, { text: ' two' }],
          },
        ],
      });

      editor.update((tx) => tx.ai.removeNodes());

      expect(editor.read.children()).toEqual([
        {
          type: 'paragraph',
          children: [{ text: ' two' }],
        },
      ]);
    });

    it('removes only the explicit matching target', () => {
      const editor = createProductEditor({
        plugins: [BaseParagraphPlugin, BaseAIPlugin],
        initialValue: [
          { type: 'paragraph', children: [{ ai: true, text: 'one' }] },
          { type: 'paragraph', children: [{ ai: true, text: 'two' }] },
        ],
      });

      editor.update((tx) => tx.ai.removeNodes({ at: [1, 0] }));

      expect(editor.read.children()).toEqual([
        { type: 'paragraph', children: [{ ai: true, text: 'one' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
    });

    it('removes AI nodes inserted earlier in the active transaction', () => {
      const editor = createProductEditor({
        plugins: [BaseParagraphPlugin, BaseAIPlugin],
        initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      });

      editor.update((tx) => {
        tx.nodes.insert({ ai: true, text: ' AI' }, { at: [0, 1] });
        tx.ai.removeNodes();
      });

      expect(editor.read.children()).toEqual([
        { type: 'paragraph', children: [{ text: 'one' }] },
      ]);
    });
  });
}

{
  const createEditor = () =>
    createProductEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

  const createSuggestionEditor = () =>
    createProductEditor({
      plugins: [BaseParagraphPlugin, BaseSuggestionPlugin, BaseAIPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

  describe('undoAI', () => {
    it('does not undo untagged AI content', () => {
      const editor = createEditor();

      editor.update.nodes.insert(
        { ai: true, text: 'plain batch' },
        { at: [0, 1] }
      );
      editor.plugin(BaseAIPlugin).update.undo();

      expect(editor.read.text.string([])).toBe('plain batch');
    });

    it('does not undo an AI batch after its AI content is gone', () => {
      const editor = createEditor();

      editor.update({ history: 'merge' }, (tx) => {
        tx.ai.markBatch();
        tx.text.insert('plain');
      });
      editor.plugin(BaseAIPlugin).update.undo();

      expect(editor.read.text.string([])).toBe('plain');
    });

    it('undoes the latest AI batch and permanently discards its redo', () => {
      const editor = createSuggestionEditor();

      editor.update({ history: 'merge' }, (tx) => {
        tx.ai.markBatch();
        tx.nodes.insert(
          { [SUGGESTION_TRANSIENT_KEY]: true, text: 'suggestion' },
          { at: [0, 1] }
        );
      });
      editor.plugin(BaseAIPlugin).update.undo();

      expect(editor.read.text.string([])).toBe('');

      editor.update.history.redo();

      expect(editor.read.text.string([])).toBe('');
    });

    it('undoes every merged chunk in the latest AI response', () => {
      const editor = createSuggestionEditor();

      editor.update({ history: 'new-batch' }, (tx) => {
        tx.ai.markBatch();
        tx.nodes.insert(
          { [SUGGESTION_TRANSIENT_KEY]: true, text: 'first' },
          { at: [0, 1] }
        );
      });
      editor.update({ history: 'merge' }, (tx) => {
        tx.ai.markBatch();
        tx.nodes.insert(
          { [SUGGESTION_TRANSIENT_KEY]: true, text: ' second' },
          { at: [0, 1] }
        );
      });

      editor.plugin(BaseAIPlugin).update.undo();

      expect(editor.read.text.string([])).toBe('');
      expect(editor.read.history.redos()).toHaveLength(0);
    });

    it('cancels an active preview before touching AI history', () => {
      const editor = createEditor();
      const original = structuredClone(editor.read.children()[0]);

      editor
        .plugin(BaseAIPlugin)
        .update.beginPreview({ originalBlocks: [original] });
      editor.update({ history: 'skip' }, (tx) => {
        tx.nodes.replaceChildren(
          [
            {
              [AI_PREVIEW_KEY]: true,
              children: [{ ai: true, text: 'preview' }],
              type: 'paragraph',
            },
            { children: [{ text: '' }], type: 'aiChat' },
          ],
          { at: [], count: tx.children().length, index: 0 }
        );
        tx.selection.set(null);
      });

      editor.plugin(BaseAIPlugin).update.undo();

      expect(editor.read.children()).toEqual([original]);
      expect(editor.plugin(BaseAIPlugin).read.hasPreview()).toBe(false);
    });
  });
}
