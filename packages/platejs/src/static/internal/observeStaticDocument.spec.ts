import { describe, expect, it } from 'bun:test';

import { createEditor } from '../../core';
import { createStaticDocument } from '../document';
import {
  observeStaticDocument,
  staticReadsEqual,
} from './observeStaticDocument';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('observed static document reads', () => {
  it('preserves root-parent absence and invalidates an observed sibling', () => {
    const editor = createEditor();
    const first = paragraph('one');
    const second = paragraph('two');
    const document = createStaticDocument(
      { children: [first, second] },
      editor.read.schema
    );
    const observed = observeStaticDocument(document);
    expect(observed.nodes.parent([])).toBeUndefined();
    expect(observed.nodes.get([1])?.[0]).toBe(second);
    expect(
      staticReadsEqual(
        observed,
        createStaticDocument(
          { children: [paragraph('changed'), second] },
          editor.read.schema
        )
      )
    ).toBe(true);
    expect(
      staticReadsEqual(
        observed,
        createStaticDocument(
          { children: [first, paragraph('changed')] },
          editor.read.schema
        )
      )
    ).toBe(false);
  });

  it('carries memoized descendant dependencies through the next observation scope', () => {
    const editor = createEditor();
    const node = paragraph('one');
    const make = (children: Array<typeof node>) =>
      observeStaticDocument(
        createStaticDocument({ children }, editor.read.schema)
      );
    const first = make([node]);
    first.nodes.get([0]);
    const second = make([node]);
    expect(staticReadsEqual(first, second)).toBe(true);
    expect(staticReadsEqual(second, make([paragraph('changed')]))).toBe(false);
  });
});
