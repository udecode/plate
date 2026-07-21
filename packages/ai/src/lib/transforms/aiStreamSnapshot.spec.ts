import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { schema } from '@platejs/plite';

import { BaseAIPlugin } from '../BaseAIPlugin';
import { AIChatPlugin } from '../../react/ai-chat/AIChatPlugin';
import {
  AI_PREVIEW_KEY,
  acceptAIPreview,
  beginAIPreview,
  cancelAIPreview,
  discardAIPreview,
  hasAIPreview,
} from './aiStreamSnapshot';

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
  type: 'p',
});

const createEditor = () =>
  createBaseEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseAIPlugin,
      AIChatPlugin.configure({ options: { open: true } }),
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    value: [createParagraph('start'), createParagraph('untouched')],
  });

const InlineFixturePlugin = createBasePlugin({
  key: 'inlineFixture',
  node: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

const installPreview = (
  editor: ReturnType<typeof createEditor>,
  { selection = editor.read.selection() } = {}
) => {
  editor.update({ history: 'skip' }).value.replace({
    children: [
      createParagraph('preview', {
        element: { [AI_PREVIEW_KEY]: true },
        text: { ai: true },
      }),
      { children: [{ text: '' }], type: 'aiChat' },
      createParagraph('untouched'),
    ],
    selection,
  });
};

describe('ai preview transforms', () => {
  it('targets AI marks to text parents and preview state to blocks', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        AIChatPlugin,
        InlineFixturePlugin,
      ],
    });
    expect(
      editor.read.schema.property({ key: 'ai', placement: 'text', type: 'p' })
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
        type: 'p',
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
        type: 'p',
      })?.value.significant
    ).toBe(true);
    expect(
      editor.read.schema.property({ key: 'ai', placement: 'text', type: 'p' })
    ).toMatchObject({
      lifecycle: {
        split: 'preserve',
        typeChange: 'preserve-if-allowed',
      },
      merge: 'replace',
    });
  });

  it('captures once and keeps the original rollback point', () => {
    const editor = createEditor();
    const initialValue = structuredClone(editor.read.children());
    const initialSelection = structuredClone(editor.read.selection());

    expect(
      beginAIPreview(editor, {
        originalBlocks: [structuredClone(initialValue[0]!)],
      })
    ).toBe(true);

    installPreview(editor, {
      selection: {
        kind: 'text',
        anchor: { offset: 7, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] },
      },
    });

    expect(beginAIPreview(editor, { originalBlocks: [] })).toBe(false);
    expect(cancelAIPreview(editor)).toBe(true);
    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('does nothing when no preview exists', () => {
    const editor = createEditor();

    expect(hasAIPreview(editor)).toBe(false);
    expect(cancelAIPreview(editor)).toBe(false);
    expect(discardAIPreview(editor)).toBe(false);
    expect(acceptAIPreview(editor, [createParagraph('done')])).toBe(false);
  });

  it('discards bookkeeping without restoring content', () => {
    const editor = createEditor();

    beginAIPreview(editor);
    installPreview(editor, { selection: null });

    expect(discardAIPreview(editor)).toBe(true);
    expect(hasAIPreview(editor)).toBe(false);
    expect(editor.read.children()[0]).toEqual(
      createParagraph('preview', {
        element: { [AI_PREVIEW_KEY]: true },
        text: { ai: true },
      })
    );
    expect(editor.read.selection()).toBeNull();
  });

  it('restores a null snapshot selection', () => {
    const editor = createEditor();

    editor.update.selection.clear();
    beginAIPreview(editor, {
      originalBlocks: [structuredClone(editor.read.children()[0]!)],
    });
    installPreview(editor, {
      selection: {
        kind: 'text',
        anchor: { offset: 7, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] },
      },
    });

    expect(cancelAIPreview(editor)).toBe(true);
    expect(editor.read.selection()).toBeNull();
  });

  it('accepts preview as one undoable batch and clears preview state', () => {
    const editor = createEditor();
    const initialValue = structuredClone(editor.read.children());
    const initialSelection = structuredClone(editor.read.selection());

    beginAIPreview(editor, {
      originalBlocks: [structuredClone(initialValue[0]!)],
    });
    installPreview(editor);

    expect(acceptAIPreview(editor)).toBe(true);
    expect(editor.read.children()).toEqual([
      createParagraph('preview'),
      createParagraph('untouched'),
    ]);
    expect(hasAIPreview(editor)).toBe(false);

    editor.update.history.undo();

    expect(editor.read.children()).toEqual(initialValue);
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('registers the preview lifecycle on BaseAIPlugin', () => {
    const editor = createEditor();
    const ai = editor.plugin(BaseAIPlugin).api;

    expect(ai.hasPreview()).toBe(false);
    expect(ai.beginPreview({ originalBlocks: [] })).toBe(true);
    expect(ai.discardPreview()).toBe(true);
    expect(ai.hasPreview()).toBe(false);
  });
});
