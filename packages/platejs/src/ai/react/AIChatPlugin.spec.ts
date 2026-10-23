import {
  BaseParagraphPlugin,
  definePlugin,
  editorCommands,
  NodeApi,
  schema,
} from '../../core';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

describe('AIChatPlugin', () => {
  it('installs its AI, history, and Markdown dependencies once', () => {
    const editor = createEditor({
      plugins: [AIChatPlugin],
      userId: 'alice',
    });
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    expect(names.indexOf('ai')).toBeLessThan(names.indexOf('aiChat'));
    expect(names.indexOf('markdown')).toBeLessThan(names.indexOf('aiChat'));
    expect(names.filter((name) => name === 'ai')).toHaveLength(1);
    expect(names.filter((name) => name === 'history')).toHaveLength(1);
    expect(names.filter((name) => name === 'markdown')).toHaveLength(1);
  });

  it('stops streaming while retaining the draft anchor', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.plugin(AIChatPlugin).store.set({ streaming: true });
    editor.plugin(AIChatPlugin).store.set({ _blockKey: editor.key([0])! });

    editor.plugin(AIChatPlugin).api.stop();

    expect(editor.plugin(AIChatPlugin).store.get('streaming')).toBe(false);
    expect(editor.plugin(AIChatPlugin).store.get('_blockKey')).toBe(
      editor.key([0])
    );
  });

  it('selects a non-empty block when opening before its end', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    });

    editor.plugin(AIChatPlugin).api.show();

    expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
      [0],
    ]);
  });

  it('keeps the caret when opening at the end of a block', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
    });
    const selection = editor.read.selection();

    editor.plugin(AIChatPlugin).api.show();

    expect(editor.read.selection()).toEqual(selection);
  });

  it('dismisses an unaccepted draft without changing content or history', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [{ children: [{ text: 'draft' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
    });
    const value = editor.read.value();
    const history = editor.read.history().undos;
    const ai = editor.plugin(AIChatPlugin);
    ai.api.show();
    ai.store.set({ _requestId: 'dismissed', streaming: true });
    ai.api.setPreview('Unaccepted response', { requestId: 'dismissed' });
    expect(ai.store.get('previewValue')).toHaveLength(1);

    editor.plugin(AIChatPlugin).api.hide({ focus: false });

    expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(false);
    expect(ai.store.get('previewValue')).toEqual([]);
    expect(ai.store.get('streaming')).toBe(false);
    expect(ai.store.get('_blockKey')).toBeNull();
    expect(ai.store.get('_requestId')).toBeNull();
    expect(editor.read.value()).toEqual(value);
    expect(editor.read.history().undos).toEqual(history);
    ai.api.setPreview('Late response', { requestId: 'dismissed' });
    expect(ai.store.get('previewValue')).toEqual([]);
  });

  it('matches the selection updated earlier in the active transaction', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'paragraph' },
        { children: [{ text: 'occupied' }], type: 'paragraph' },
      ],
    });

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
      tx.command(editorCommands.insertText, {
        text: ' ',
      });
    });

    expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'occupied' }], type: 'paragraph' },
    ]);
  });

  it.each(['accept', 'insert below'] as const)(
    'keeps the answer when %s cannot land below a block in a full parent',
    (action) => {
      const FullParentPlugin = definePlugin('aiFullParent', {
        schema: {
          element: {
            blockContent: true,
            content: schema.content.types(['paragraph'], { max: 1 }),
          },
        },
      });
      const editor = createEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseAIPlugin,
          AIChatPlugin,
          FullParentPlugin,
        ],
        userId: 'alice',
        initialValue: [
          {
            children: [{ children: [{ text: 'Only' }], type: 'paragraph' }],
            type: 'aiFullParent',
          },
        ],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0, 0], offset: 4 },
          focus: { path: [0, 0, 0], offset: 4 },
        },
      });
      const value = editor.read.value();
      const ai = editor.plugin(AIChatPlugin);

      if (action === 'accept') {
        ai.store.set({ chatSelection: null, mode: 'insert' });
        ai.api.setPreview('Answer');
        ai.api.accept();
      } else {
        ai.store.set({
          chatNodes: [],
          chatSelection: editor.read.selection(),
          mode: 'chat',
        });
        ai.api.setPreview('Answer');
        ai.api.insertBelow();
      }

      expect({
        preview: ai.store.get('previewValue'),
        value: editor.read.value(),
      }).toEqual({
        preview: [{ children: [{ text: 'Answer' }], type: 'paragraph' }],
        value,
      });
    }
  );

  it.each([
    [2, 'an empty paragraph'],
    [1, 'an empty paragraph'],
    [2, 'a selected block'],
    [1, 'a selected block'],
  ] as const)(
    'lands a %i-block answer over %s in a parent capped at two only when it fits',
    (blocks, target) => {
      const fits = blocks === 1;
      const TwoParentPlugin = definePlugin('aiTwoParent', {
        schema: {
          element: {
            blockContent: true,
            content: schema.content.types(['paragraph'], { max: 2 }),
          },
        },
      });
      const text = target === 'an empty paragraph' ? '' : 'Only';
      const editor = createEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseAIPlugin,
          AIChatPlugin,
          TwoParentPlugin,
        ],
        userId: 'alice',
        initialValue: [
          {
            children: [
              { children: [{ text }], type: 'paragraph' },
              { children: [{ text: 'Sibling' }], type: 'paragraph' },
            ],
            type: 'aiTwoParent',
          },
        ],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0, 0], offset: 0 },
          focus: { path: [0, 0, 0], offset: 0 },
        },
      });
      const ai = editor.plugin(AIChatPlugin);

      if (target === 'an empty paragraph') {
        ai.store.set({ chatSelection: null, mode: 'insert' });
      } else {
        editor.update.selection.setNodes([[0, 0]]);
        ai.api.show();
        ai.store.set({ mode: 'chat' });
      }
      ai.api.setPreview(fits ? 'One' : 'One\n\nTwo');
      const preview = ai.store.get('previewValue');
      ai.api.accept();

      expect({
        preview: ai.store.get('previewValue'),
        texts: editor.read.nodes
          .blocks({ at: [] })
          .map(([node]) => NodeApi.string(node)),
      }).toEqual(
        fits
          ? { preview: [], texts: ['One', 'Sibling'] }
          : { preview, texts: [text, 'Sibling'] }
      );
    }
  );

  it('selects the blocks a length limit lets insert below land', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [{ children: [{ text: 'Only' }], type: 'paragraph' }],
      maxLength: 10,
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
    });
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({
      chatNodes: [],
      chatSelection: editor.read.selection(),
      mode: 'chat',
    });
    ai.api.setPreview('Answer\n\nMore');
    ai.api.insertBelow();

    expect({
      children: editor.read.children(),
      selection: editor.read.selection(),
    }).toMatchObject({
      children: [
        { children: [{ text: 'Only' }], type: 'paragraph' },
        { children: [{ text: 'Answer' }], type: 'paragraph' },
      ],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 6, path: [1, 0] },
      },
    });
  });
});
