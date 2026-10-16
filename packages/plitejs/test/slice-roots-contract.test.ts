import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  editorCommands,
  SelectionApi,
  transfer,
} from 'plitejs';

import { dispatchCommand } from '../src/core/command-registry';
import {
  paragraph,
  LandingSchema,
  SharedPortalSchema,
  rootOwner,
  carried,
} from './support/slice-landing';

describe('slice content roots', () => {
  it('lands a paste carrying roots over a range that holds the owner of an exclusive root', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      }),
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(
          ContentSlice.fromJSON({
            content: [rootOwner('body:1')],
            openEnd: 0,
            openStart: 0,
            roots: { 'body:1': [paragraph('X')] },
          })
        ),
        editor.read.value(),
      ],
      [
        true,
        {
          children: [rootOwner('body:1:copy'), paragraph('aa')],
          roots: { 'body:1:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('lands a paste carrying a root after an earlier step in its update', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa'), paragraph('bb')],
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.insert(paragraph('new'), { at: [2] });
      result = tx.slice.replace(carried('body:1'), {
        at: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        },
      });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [
            paragraph('aa'),
            rootOwner('body:1:copy'),
            paragraph('new'),
          ],
          roots: { 'body:1:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('refuses a raw slice write that names an exclusive root another block owns', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      result = tx.slice.replace(ContentSlice.closed([rootOwner('body:1')]), {
        at: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        },
      });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        false,
        {
          children: [rootOwner('body:1'), paragraph('aa')],
          roots: { 'body:1': [paragraph('Body')] },
        },
      ]
    );
  });

  it('refuses a raw slice write that names a root the document lacks', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa')],
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      result = tx.slice.replace(ContentSlice.closed([rootOwner('missing')]), {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [false, { children: [paragraph('aa')] }]
    );
  });

  it('drops an exclusive root an earlier step orphaned when a slice write lands', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      result = tx.slice.replace(carried('src'), {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [rootOwner('src:copy')],
          roots: { 'src:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('keeps an exclusive root whose owner a later step restores after a paste elsewhere', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa'), paragraph('cc')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }));
      result = tx.command(editorCommands.replaceSlice, {
        slice: ContentSlice.closed([paragraph('x')]),
      });
      tx.nodes.insert(rootOwner('body:1'), { at: [0] });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [rootOwner('body:1'), paragraph('x'), paragraph('cc')],
          roots: { 'body:1': [paragraph('Body')] },
        },
      ]
    );
  });

  it('lands a paste over selected blocks while an earlier step leaves a second exclusive owner that a later step removes', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa'), paragraph('cc')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.insert(rootOwner('body:1', 'dup'), { at: [3] });
      tx.selection.set(SelectionApi.nodes([[1]], { mode: 'block' }));
      result = tx.command(editorCommands.replaceSlice, {
        slice: ContentSlice.closed([paragraph('x')]),
      });
      tx.nodes.remove({ at: [3] });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [rootOwner('body:1'), paragraph('x'), paragraph('cc')],
          roots: { 'body:1': [paragraph('Body')] },
        },
      ]
    );
  });

  it('lands a paste over selected blocks while an earlier step leaves an owner missing its roots that a later step removes', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa'), paragraph('cc')],
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.insert(
        { children: [{ text: 'P' }], type: 'portal' },
        { at: [2] }
      );
      tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }));
      result = tx.command(editorCommands.replaceSlice, {
        slice: ContentSlice.closed([paragraph('x')]),
      });
      tx.nodes.remove({ at: [2] });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [true, { children: [paragraph('x'), paragraph('cc')] }]
    );
  });

  it('lands a closed embed pasted mid-paragraph as text and drops its carried root', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      }),
      initialValue: [paragraph('aa')],
      plugins: [LandingSchema],
    });

    const result = editor.update.slice.replace(carried('src'));

    assert.deepEqual(
      [result, editor.read.value()],
      [true, { children: [paragraph('aPa')] }]
    );
  });

  it('lands a paste carrying a root dispatched at a caret outside an update', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      }),
      initialValue: [paragraph('aa'), paragraph('')],
      plugins: [LandingSchema],
    });

    const result = dispatchCommand(editor, editorCommands.replaceSlice, {
      slice: carried('src'),
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [paragraph('aa'), rootOwner('src:copy')],
          roots: { 'src:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('drops a root an earlier slice write created when a later one replaces its owner', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa'), paragraph('cc')],
      plugins: [SharedPortalSchema],
    });
    let results: boolean[] = [];

    editor.update((tx) => {
      results = [
        tx.slice.replace(carried('first'), {
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 2, path: [0, 0] },
          },
        }),
        tx.slice.replace(carried('second'), {
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
        }),
      ];
    });

    assert.deepEqual(
      [results, editor.read.value()],
      [
        [true, true],
        {
          children: [rootOwner('second:copy'), paragraph('cc')],
          roots: { 'second:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('moves a range holding the owner of an exclusive root to a block edge', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa'), paragraph('cc')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema, transfer()],
    });

    const moved = editor.api.transfer.move({
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [1, 0] },
      },
      to: { edge: 'after', key: editor.key([2]) },
    });

    assert.deepEqual(
      [moved.status, editor.read.value()],
      [
        'moved',
        {
          children: [
            paragraph('a'),
            paragraph('cc'),
            rootOwner('body:1:copy'),
            paragraph('a'),
          ],
          roots: { 'body:1:copy': [paragraph('Body')] },
        },
      ]
    );
  });
});
