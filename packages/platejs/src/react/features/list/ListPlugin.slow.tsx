import { act, render } from '@testing-library/react';
import React from 'react';

import type { Element } from '../../../core';
import { getListIndexMetrics } from '../../../features/list/lib/listIndex.internal';
import { createEditor, EditorContent, EditorRoot } from '../../core';
import { ParagraphPlugin } from '../../plugins/paragraph/ParagraphPlugin';
import { ListPlugin } from './ListPlugin';

const COUNT = 10_000;

const insertAtTop = (listed: boolean) => {
  let renders: string[] = [];
  const CountedParagraph = ({ attributes, children, element }: any) => {
    renders.push(element.children[0].text);

    return <div {...attributes}>{children}</div>;
  };
  const block = (text: string) =>
    ({
      children: [{ text }],
      type: 'paragraph',
      ...(listed ? { indent: 1, listType: 'numbered' } : {}),
    }) as Element;
  const editor = createEditor({
    initialValue: Array.from({ length: COUNT }, (_, index) =>
      block(`Item ${index}`)
    ),
    plugins: [
      ParagraphPlugin.configure({ component: CountedParagraph }),
      ...(listed ? [ListPlugin] : []),
    ],
  });
  const { container, unmount } = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <EditorContent />
    </EditorRoot>
  );

  renders = [];
  act(() => {
    editor.update.nodes.insert(block('New'), { at: [0] });
  });

  const starts = [...container.querySelectorAll('ol')].map((list) =>
    Number(list.getAttribute('start'))
  );

  unmount();

  return { renders, starts };
};

describe('ListPlugin at 10,000 items', () => {
  it('renders no more on a top insert than plain paragraphs and writes every mounted number', () => {
    const plain = insertAtTop(false);
    const listed = insertAtTop(true);

    expect(listed.renders).toEqual(plain.renders);
    expect(listed.starts.length).toBe(COUNT + 1);
    expect(listed.starts.findIndex((start, index) => start !== index + 1)).toBe(
      -1
    );
  }, 120_000);
});

const insertAmongLists = (lists: number) => {
  let renders = 0;
  const CountedParagraph = ({ attributes, children }: any) => {
    renders += 1;

    return <div {...attributes}>{children}</div>;
  };
  const item = (text: string, listId: string) =>
    ({
      children: [{ text }],
      indent: 1,
      listId,
      listType: 'numbered',
      type: 'paragraph',
    }) as Element;
  const editor = createEditor({
    initialValue: Array.from({ length: lists }, (_list, list) => [
      ...Array.from({ length: 10 }, (_item, index) =>
        item(`${list}.${index}`, `l${list}`)
      ),
      { children: [{ text: 'Between' }], type: 'paragraph' },
    ]).flat(),
    plugins: [
      ParagraphPlugin.configure({ component: CountedParagraph }),
      ListPlugin,
    ],
  });
  const { container, unmount } = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <EditorContent />
    </EditorRoot>
  );
  const middle = Math.floor(lists / 2) * 11;
  const writes: Node[] = [];
  const observer = new MutationObserver((records) => {
    for (const record of records) writes.push(record.target);
  });

  observer.observe(container, {
    attributeFilter: ['start'],
    attributes: true,
    subtree: true,
  });

  const before = getListIndexMetrics().visited;
  const mounted = new Map(
    [...container.querySelectorAll('ol')].map((list) => [list, list.start])
  );
  const nativeQuerySelector = Element.prototype.querySelector;
  let listLookups = 0;

  renders = 0;
  act(() => {
    editor.update.text.insert('x', {
      at: { path: [middle + 4, 0], offset: 0 },
    });
  });
  Element.prototype.querySelector = function querySelector(
    this: Element,
    selector: string
  ) {
    if (selector === 'ol') listLookups += 1;

    return nativeQuerySelector.call(this, selector);
  };
  try {
    act(() => {
      editor.update.nodes.insert(item('New', `l${Math.floor(lists / 2)}`), {
        at: [middle + 5],
      });
    });
  } finally {
    Element.prototype.querySelector = nativeQuerySelector;
  }
  observer.takeRecords().forEach((record) => writes.push(record.target));
  observer.disconnect();

  const changed = [...mounted].filter(
    ([list, start]) => list.isConnected && list.start !== start
  ).length;

  const starts = [...container.querySelectorAll('ol')]
    .slice(Math.floor(lists / 2) * 10, Math.floor(lists / 2) * 10 + 11)
    .map((list) => Number(list.getAttribute('start')));

  unmount();

  return {
    changed,
    listLookups,
    renders,
    starts,
    visited: getListIndexMetrics().visited - before,
    writes: writes.length,
  };
};

describe('ListPlugin among N lists of 10', () => {
  it('types and inserts into one list at the same cost for 10, 100 and 1,000 lists', () => {
    const [ten, hundred, thousand] = [10, 100, 1000].map(insertAmongLists);

    expect(ten.starts).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(hundred).toEqual(ten);
    expect(thousand).toEqual(ten);
  }, 120_000);

  it('writes exactly the starts whose numbers changed and visits only their hosts', () => {
    for (const lists of [10, 100, 1000]) {
      const { changed, listLookups, writes } = insertAmongLists(lists);

      expect(changed).toBe(5);
      expect({ lists, listLookups, writes }).toEqual({
        lists,
        listLookups: changed + 1,
        writes: changed,
      });
    }
  }, 120_000);
});
