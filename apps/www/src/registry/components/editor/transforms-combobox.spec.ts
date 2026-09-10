import { describe, expect, it } from 'bun:test';

import {
  BaseCodeBlockPlugin,
  BaseHorizontalRulePlugin,
  PLUGINS,
} from 'platejs';
import { BaseCalloutPlugin } from 'platejs/callout';
import { BaseCodeDrawingPlugin } from 'platejs/code-drawing';
import { BaseComboboxPlugin } from 'platejs/combobox';
import { BaseDatePlugin } from 'platejs/date';
import { BaseExcalidrawPlugin } from 'platejs/excalidraw';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from 'platejs/footnote';
import { BaseColumnPlugin } from 'platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';
import { createEditor } from 'platejs/react';
import { BaseSlashPlugin } from 'platejs/slash-command';
import { BaseTablePlugin } from 'platejs/table';
import { BaseTocPlugin } from 'platejs/toc';

import { BaseBasicBlocksKit } from './basic-blocks-static';
import { BaseDetailsKit } from './details-static';
import { BaseListKit } from './list-static';
import { insertBlock, insertInlineElement } from './transforms';

describe('slash insertion transaction', () => {
  it.each([
    [PLUGINS.paragraph, { type: 'paragraph' }],
    ['heading-1', { type: 'heading', level: 1 }],
    ['heading-2', { type: 'heading', level: 2 }],
    ['heading-3', { type: 'heading', level: 3 }],
    ['disc', { type: 'paragraph', listType: 'bulleted' }],
    ['decimal', { type: 'paragraph', listType: 'numbered' }],
    ['todo', { type: 'paragraph', listType: 'task' }],
    [PLUGINS.details, { type: 'details' }],
    [PLUGINS.codeBlock, { type: 'codeBlock' }],
    [PLUGINS.table, { type: 'table' }],
    [PLUGINS.blockquote, { type: 'blockquote' }],
    [PLUGINS.callout, { type: 'callout' }],
    [PLUGINS.toc, { type: 'toc' }],
    ['action_three_columns', { type: 'columnGroup' }],
    [PLUGINS.equation, { type: 'equation' }],
    [PLUGINS.excalidraw, { type: 'excalidraw' }],
    [PLUGINS.codeDrawing, { type: 'codeDrawing' }],
    [PLUGINS.date, { type: 'date' }],
    ['action_footnote', { type: 'footnoteReference' }],
    [PLUGINS.inlineEquation, { type: 'inlineEquation' }],
  ] as const)(
    'composes %s with input removal and one-step undo',
    (action, expected) => {
      const editor = createEditor({
        plugins: [
          ...BaseBasicBlocksKit,
          ...BaseListKit,
          ...BaseDetailsKit,
          BaseCodeBlockPlugin,
          BaseHorizontalRulePlugin,
          BaseCalloutPlugin,
          BaseCodeDrawingPlugin,
          BaseDatePlugin,
          BaseExcalidrawPlugin,
          BaseFootnotePlugin,
          BaseFootnoteDefinitionPlugin,
          BaseColumnPlugin,
          BaseEquationPlugin,
          BaseInlineEquationPlugin,
          BaseSlashPlugin,
          BaseTablePlugin,
          BaseTocPlugin,
        ],
        initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      });
      editor.update.text.insert('/');
      const input = editor.key(editor.read.children()[0].children[1]);
      const before = editor.read.value();
      const { version } = editor.read.lastCommit()!;
      const inline =
        action === PLUGINS.date ||
        action === 'action_footnote' ||
        action === PLUGINS.inlineEquation;

      expect(
        editor.plugin(BaseComboboxPlugin).api.commit(input, (tx) => {
          if (inline) insertInlineElement(editor, action, tx);
          else insertBlock(editor, action, { upsert: true, tx });
        })
      ).toBe(true);
      const first = editor.read.children()[0];
      expect(inline ? first.children[1] : first).toMatchObject(expected);
      expect(editor.read.lastCommit()!.version - version).toBe(1);
      expect(editor.read.nodes.get(input)).toBeUndefined();
      const after = editor.read.value();
      editor.update.history.undo();
      expect(editor.read.value()).toEqual(before);
      editor.update.history.redo();
      expect(editor.read.value()).toEqual(after);
    }
  );
});
