import { describe, expect, it } from 'bun:test';

import { createEditor, NodeApi } from '../../../core';
import { BaseTablePlugin } from './BaseTablePlugin';

const tableOf = (...rows: string[][]) => ({
  children: rows.map((cells) => ({
    children: cells.map((text) => ({
      children: [{ children: [{ text }], type: 'paragraph' }],
      type: 'tableCell',
    })),
    type: 'tableRow',
  })),
  type: 'table',
});

const createTable = (table: ReturnType<typeof tableOf>) =>
  createEditor({ initialValue: [table], plugins: [BaseTablePlugin] });

const rowTexts = (editor: ReturnType<typeof createTable>) =>
  editor.read.children()[0].children.map((row) => NodeApi.string(row));

describe('table row transfer landing', () => {
  it('reorders rows', () => {
    const editor = createTable(tableOf(['1'], ['2']));

    editor.api.transfer.move({
      nodes: [editor.key([0, 0])!],
      to: { edge: 'after', key: editor.key([0, 1])! },
    });

    expect(rowTexts(editor)).toEqual(['2', '1']);
  });

  it('refuses a row beside a block inside a cell', () => {
    const editor = createTable(tableOf(['1'], ['2']));

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0, 1])!],
        to: { edge: 'after', key: editor.key([0, 0, 0, 0])! },
      }).status
    ).toBe('refused');
    expect(rowTexts(editor)).toEqual(['1', '2']);
  });

  it('refuses a row move across a row span', () => {
    const spanned = tableOf(['a', 'b'], ['c'], ['d', 'e']);

    Object.assign(spanned.children[0].children[0], { rowSpan: 2 });

    const editor = createTable(spanned);

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0, 2])!],
        to: { edge: 'before', key: editor.key([0, 1])! },
      }).status
    ).toBe('refused');
    expect(rowTexts(editor)).toEqual(['ab', 'c', 'de']);
  });

  it('lands a block inside a cell', () => {
    const editor = createEditor({
      initialValue: [
        tableOf(['1']),
        { children: [{ text: 'p' }], type: 'paragraph' },
      ],
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { edge: 'after', key: editor.key([0, 0, 0, 0])! },
      }).status
    ).toBe('moved');
    expect(NodeApi.string(editor.read.children()[0])).toBe('1p');
  });

  it('refuses dragging a cell', () => {
    const editor = createTable(tableOf(['a', 'b']));

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0, 0, 0])!],
        to: { edge: 'after', key: editor.key([0, 0, 1])! },
      }).status
    ).toBe('refused');
    expect(rowTexts(editor)).toEqual(['ab']);
  });

  it('refuses a row into another table', () => {
    const editor = createEditor({
      initialValue: [tableOf(['1']), tableOf(['2'])],
      plugins: [BaseTablePlugin],
    });

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0, 0])!],
        to: { edge: 'after', key: editor.key([1, 0])! },
      }).status
    ).toBe('refused');
    expect(
      editor.read.children().map((table) => NodeApi.string(table))
    ).toEqual(['1', '2']);
  });
});
