import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { BaseMentionInputPlugin, BaseMentionPlugin } from './BaseMentionPlugin';
import { MentionInputPlugin, MentionPlugin } from '../react/MentionPlugin';

describe('BaseMentionPlugin', () => {
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
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });
    const inputPlugin = editor.getPlugin(BaseMentionInputPlugin);
    const state = editor.plugin(BaseMentionPlugin).store.get();

    expect(inputPlugin.key).toBe('mentionInput');
    expect(inputPlugin.type).toBe(NODES.mentionInput);
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
      type: NODES.mentionInput,
    });
    expect(
      editor.read.schema.element(BaseMentionInputPlugin)?.behavior
    ).toMatchObject({
      inline: true,
      void: true,
      voidKind: 'inline',
    });

    editor.update.mention.insert({ key: 'u1', value: 'Ada' });

    const entry = editor.read.nodes.get<Element>([0]);
    assert(entry);
    const children = entry[0].children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });

  it('replaces a typed trigger with the transient mention input', () => {
    const editor = createBaseEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor.update.text.insert('@');

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            trigger: '@',
            type: NODES.mentionInput,
          },
          { text: '' },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('inserts a trailing space when the mention lands at block end', () => {
    const MentionPlugin = BaseMentionPlugin.configure({
      initialState: { insertSpaceAfterMention: true },
    });
    const editor = createBaseEditor({
      plugins: [MentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hi' }], type: 'p' }],
    });

    editor.plugin(MentionPlugin).update.insert({ key: 'u1', value: 'Ada' });

    const entry = editor.read.nodes.get<Element>([0]);
    assert(entry);
    const children = entry[0].children;

    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: ' ' });
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('skips the trailing space when the mention is inserted mid-block', () => {
    const MentionPlugin = BaseMentionPlugin.configure({
      initialState: { insertSpaceAfterMention: true },
    });
    const editor = createBaseEditor({
      plugins: [MentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.plugin(MentionPlugin).update.insert({ key: 'u1', value: 'Ada' });

    const entry = editor.read.nodes.get<Element>([0]);
    assert(entry);

    expect(entry[0].children).toMatchObject([
      { text: 'he' },
      {
        children: [{ text: '' }],
        key: 'u1',
        type: KEYS.mention,
        value: 'Ada',
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
              key: 'u1',
              type: KEYS.mention,
              value: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
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
              key: 'u1',
              type: KEYS.mention,
              value: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
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
              key: 'u1',
              type: KEYS.mention,
              value: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.selection.move({ distance: 1, unit: 'character' });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
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
              key: 'u1',
              type: KEYS.mention,
              value: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.selection.move({
      distance: 1,
      reverse: true,
      unit: 'character',
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});
