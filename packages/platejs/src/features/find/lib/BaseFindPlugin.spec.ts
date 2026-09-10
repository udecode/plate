import { expect, spyOn, test } from 'bun:test';

import { NodeApi, createEditor } from '../../../core';
import { BaseLinkPlugin } from '../../link';
import { BaseFindPlugin } from './BaseFindPlugin';

const createFindEditor = () =>
  createEditor({
    plugins: [BaseFindPlugin, BaseLinkPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'hello ' },
          {
            type: 'link',
            url: 'https://platejs.org',
            children: [{ text: 'world' }],
          },
          { text: ' again' },
        ],
      },
      { type: 'paragraph', children: [{ text: 'hello outside' }] },
    ],
  });

test('finds literal case-insensitive text across inline nodes without document writes', () => {
  const editor = createFindEditor();
  const { api, store, update } = editor.plugin(BaseFindPlugin);
  const before = editor.read.children();
  api.search('HELLO world again');
  expect(store.get('count')).toBe(1);
  expect(store.get('activeMatch')?.range).toEqual({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 2], offset: 6 },
  });
  expect(editor.read.children()).toBe(before);
  expect(update.select()).toBe(true);
  expect(editor.read.selection()).toEqual(store.get('activeMatch')?.range);
  expect(editor.read.children()).toBe(before);
});

test('wraps matches without rescanning on navigation or selection', () => {
  const editor = createFindEditor();
  const { api, store, update } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  const matches = store.get('matches');
  const find = spyOn(NodeApi, 'findTextRanges');
  try {
    api.move(-1);
    expect(store.get('activeIndex')).toBe(1);
    api.move(1);
    expect(store.get('activeIndex')).toBe(0);
    update.select();
    api.search('hello');
    expect(find).not.toHaveBeenCalled();
    expect(store.get('matches')).toBe(matches);
    api.search('');
    expect(store.get('activeMatch')).toBeNull();
    expect(update.select()).toBe(false);
  } finally {
    find.mockRestore();
  }
});

test('refreshes edited text, undo and replacement without a mounted view', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  editor.update.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
  expect(store.get('count')).toBe(3);
  expect(store.get('activeIndex')).toBe(1);
  editor.update.history.undo();
  expect(store.get('count')).toBe(2);
  editor.update.value.replace({
    children: [{ type: 'paragraph', children: [{ text: 'unmatched' }] }],
  });
  expect(store.get('count')).toBe(0);
  expect(store.get('activeIndex')).toBe(-1);
});

test('isolates concurrent editors and owns immutable result snapshots', () => {
  const first = createFindEditor();
  const second = createFindEditor();
  const owner = first.plugin(BaseFindPlugin);
  owner.api.search('hello');
  expect(second.plugin(BaseFindPlugin).store.get('count')).toBe(0);
  const matches = owner.store.get('matches');
  expect(Object.isFrozen(matches)).toBe(true);
  expect(Object.isFrozen(matches[0].range.anchor.path)).toBe(true);
  owner.api.search('world');
  expect(matches).toHaveLength(2);
  expect(owner.store.get('matches')).toHaveLength(1);
});

test('publishes a failure and recovers on a subsequent query', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  const failure = new Error('Unavailable');
  const find = spyOn(NodeApi, 'findTextRanges').mockImplementationOnce(() => {
    throw failure;
  });
  try {
    api.search('hello');
    expect(store.get('error')).toBe(failure);
    expect(store.get('count')).toBe(0);
    api.search('world');
    expect(store.get('error')).toBeNull();
    expect(store.get('count')).toBe(1);
  } finally {
    find.mockRestore();
  }
});
