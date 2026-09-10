import {
  BaseParagraphPlugin,
  createEditor,
  defineBasePlugin,
  property,
  schema,
  target,
} from '../../../core';
import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

const data = (
  id: string,
  type: 'insert' | 'remove' | 'update',
  extra = {}
) => ({
  id,
  createdAt: Number.parseInt(id, 10) || 1,
  userId: 'alice',
  type,
  ...extra,
});

it('reads current review membership during a transaction and ignores an absent ID', () => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, BaseSuggestionPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'suggested',
            suggestion: true,
            suggestion_one: data('one', 'insert'),
          },
        ],
      },
    ],
  });
  const before = editor.read.children();
  editor.plugin(BaseSuggestionPlugin).update.accept('absent');
  expect(editor.read.children()).toBe(before);
  editor.update((tx) => {
    expect(tx.suggestion.reviews().map(({ id }) => id)).toEqual(['one']);
    tx.suggestion.reject('one');
    expect(tx.suggestion.reviews()).toEqual([]);
  });
});
test('resolves empty block kinds and inherited inline rendering without depending on labels', () => {
  const Inline = defineBasePlugin('inlineThing', {
    schema: {
      element: {
        inline: true,
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, Inline, BaseSuggestionPlugin],
    initialValue: [
      {
        type: 'paragraph',
        suggestion: data('empty', 'insert'),
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'inlineThing',
            children: [
              {
                text: 'child',
                suggestion: true,
                suggestion_child: data('child', 'remove'),
              },
            ],
          },
          { text: '' },
        ],
      },
    ],
  });
  const suggestion = editor.plugin(BaseSuggestionPlugin);
  expect(
    suggestion.read.reviews().map(({ id, type }) => ({ id, type }))
  ).toEqual([
    { id: 'empty', type: 'insert' },
    { id: 'child', type: 'remove' },
  ]);
  expect(
    suggestion.api.suggestionData(editor.read.children()[1].children[1])
  ).toMatchObject({ id: 'child', type: 'remove' });
});
test('accepts the requested current ID, retains another ID, and supports rejection and history', () => {
  const Bold = defineBasePlugin('bold', {
    schema: { mark: property.boolean() },
  });
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, Bold, BaseSuggestionPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'original',
            bold: true,
            suggestion: true,
            suggestion_insert: data('insert', 'insert'),
            suggestion_update: data('update', 'update', {
              newProperties: { bold: true },
            }),
          },
        ],
      },
    ],
  });
  const suggestion = editor.plugin(BaseSuggestionPlugin);
  const before = editor.read.children();
  editor.update({ history: 'new-batch' }).suggestion.accept('insert');
  expect(editor.read.text.string([])).toBe('original');
  expect(suggestion.read.reviews().map(({ id }) => id)).toEqual(['update']);
  editor.update({ history: 'new-batch' }).suggestion.reject('update');
  expect(editor.read.children()[0].children[0]).toEqual({ text: 'original' });
  editor.update.history.undo();
  expect(suggestion.read.reviews().map(({ id }) => id)).toEqual(['update']);
  editor.update.history.undo();
  expect(editor.read.children()).toEqual(before);
});
test('rejects current inline property changes from the ID without a copied description', () => {
  const Inline = defineBasePlugin('inlineThing', {
    schema: {
      element: {
        inline: true,
        content: schema.content.text({ default: 'text', min: 1 }),
      },
      properties: {
        label: schema.elementProperty('label', property.string(), {
          target: target.group('inline'),
        }),
      },
    },
  });
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, Inline, BaseSuggestionPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'inlineThing',
            label: 'after',
            suggestion: true,
            suggestion_change: data('change', 'update', {
              properties: { label: 'before' },
              newProperties: { label: 'after' },
            }),
            children: [{ text: 'visible' }],
          },
          { text: '' },
        ],
      },
    ],
  });
  editor.plugin(BaseSuggestionPlugin).update.reject('change');
  expect(editor.read.children()[0].children[1]).toMatchObject({
    label: 'before',
  });
  expect(editor.plugin(BaseSuggestionPlugin).read.reviews()).toEqual([]);
});
