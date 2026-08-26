import assert from 'node:assert/strict';

import { createBaseEditor } from '@platejs/core';
import { ElementApi, schema } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { MentionInputPlugin, MentionPlugin } from '../react/MentionPlugin';
import { BaseMentionInputPlugin, BaseMentionPlugin } from './BaseMentionPlugin';

describe('BaseMentionPlugin', () => {
  it('requires a non-empty persisted ref', () => {
    const editor = createBaseEditor({ plugins: [BaseMentionPlugin] });

    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            ref: '   ',
            type: 'mention',
          },
        ],
      })
    ).toThrow(/ref.*validation/i);
  });

  it('declares the input as an exact required Base and React dependency', () => {
    expect(BaseMentionPlugin.dependencies).toEqual([BaseMentionInputPlugin]);
    expect(MentionPlugin.dependencies).toEqual([MentionInputPlugin]);
  });

  it('rejects a disabled required mention-input dependency', () => {
    expect(() =>
      createBaseEditor({
        plugins: [
          BaseMentionPlugin,
          BaseMentionInputPlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(
      /mention.*disabled.*mentionInput|mentionInput.*disabled.*mention/i
    );
  });

  it('configures mention defaults and inserts markable void mention nodes', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });
    const inputPlugin = editor.plugin(BaseMentionInputPlugin);
    const state = editor.plugin(BaseMentionPlugin).store.get();

    expect(inputPlugin.name).toBe('mentionInput');
    expect(inputPlugin.name).toBe(PLUGINS.mentionInput);
    expect(
      editor.read.schema.element(BaseMentionPlugin)?.behavior
    ).toMatchObject({
      inline: true,
      markableVoid: true,
      void: true,
      voidKind: 'markable-inline',
    });
    expect(state.trigger).toBe('@');
    expect(state.createComboboxInput?.('@')).toEqual({
      children: [{ text: '' }],
      trigger: '@',
      type: 'mentionInput',
    });
    expect(
      editor.read.schema.element(BaseMentionInputPlugin)?.behavior
    ).toMatchObject({
      inline: true,
      void: true,
      voidKind: 'inline',
    });

    editor.update.mention.insert({ ref: 'u1', label: 'Ada' });

    const entry = editor.read.nodes.get([0], {
      match: ElementApi.isElement,
    });
    assert.ok(entry);
    const { children } = entry[0];

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      ref: 'u1',
      type: 'mention',
      label: 'Ada',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });

  it('rejects blank mention refs before insertion', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    expect(() => editor.update.mention.insert({ ref: '   ' })).toThrow(
      /mention ref must be a non-empty string/i
    );
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('round-trips mention identity through HTML clipboard data', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 7, path: [0, 0] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'before ' },
            {
              children: [{ text: '' }],
              ref: 'user-1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const html = data.getData('text/html');
    const element = new DOMParser()
      .parseFromString(html, 'text/html')
      .body.querySelector('[data-plate-mention]');

    expect(element?.getAttribute('data-plate-mention-ref')).toBe('user-1');
    expect(element?.getAttribute('data-plate-mention-label')).toBe('Ada');
    expect(element?.textContent).toBe('@Ada');

    expect(editor.api.html.deserialize({ element: html })).toEqual([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            ref: 'user-1',
            type: 'mention',
            label: 'Ada',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('ignores blank mention refs from external codecs', () => {
    const editor = createBaseEditor({ plugins: [BaseMentionPlugin] });

    expect(
      editor.api.html.deserialize({
        element:
          '<span data-plate-mention data-plate-mention-ref=" ">@blank</span>',
      })
    ).toEqual([
      {
        children: [{ text: '@blank' }],
        type: 'paragraph',
      },
    ]);
  });

  it('creates transient inputs with the configured schema type', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
      schema: {
        overrides: [
          schema.override(BaseMentionInputPlugin, {
            element: { type: 'customMentionInput' },
          }),
        ],
      },
    });

    expect(
      editor.plugin(BaseMentionPlugin).store.get('createComboboxInput')('@')
    ).toMatchObject({ type: 'customMentionInput' });
  });

  it('replaces a typed trigger with the transient mention input', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.update.text.insert('@');

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            trigger: '@',
            type: 'mentionInput',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('inserts a trailing space when the mention lands at block end', () => {
    const innerMentionPlugin = BaseMentionPlugin.configure({
      initialState: { insertSpaceAfterMention: true },
    });
    const editor = createBaseEditor({
      plugins: [innerMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hi' }], type: 'paragraph' }],
    });

    editor
      .plugin(innerMentionPlugin)
      .update.insert({ ref: 'u1', label: 'Ada' });

    const entry = editor.read.nodes.get([0], {
      match: ElementApi.isElement,
    });
    assert.ok(entry);
    const { children } = entry[0];

    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      ref: 'u1',
      type: 'mention',
      label: 'Ada',
    });
    expect(children[2]).toEqual({ text: ' ' });
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('skips the trailing space when the mention is inserted mid-block', () => {
    const innerMentionPlugin2 = BaseMentionPlugin.configure({
      initialState: { insertSpaceAfterMention: true },
    });
    const editor = createBaseEditor({
      plugins: [innerMentionPlugin2],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    editor
      .plugin(innerMentionPlugin2)
      .update.insert({ ref: 'u1', label: 'Ada' });

    const entry = editor.read.nodes.get([0], {
      match: ElementApi.isElement,
    });
    assert.ok(entry);

    expect(entry[0].children).toMatchObject([
      { text: 'he' },
      {
        children: [{ text: '' }],
        ref: 'u1',
        type: 'mention',
        label: 'Ada',
      },
      { text: 'llo' },
    ]);
  });

  it('deleteBackward removes the adjacent mention atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
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
              ref: 'u1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next mention atom', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
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
              ref: 'u1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('moves right into the mention child so the inline void stays keyboard-accessible', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
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
              ref: 'u1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.selection.move({ distance: 1, unit: 'character' });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves left into the mention child so the inline void stays keyboard-accessible', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
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
              ref: 'u1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.selection.move({
      distance: 1,
      reverse: true,
      unit: 'character',
    });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});
