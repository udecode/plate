import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DocumentIndex } from '../src/core/change/document-index';
import {
  type EmptyTextRead,
  retractionOf,
} from '../src/core/change/retraction';
import {
  RootChange,
  type RootChangeSection,
} from '../src/core/change/root-change';
import { type JsonNode, PreparedTokenSlice } from '../src/core/change/tokens';

const text = (value: string) => ({ text: value });
const p = (value: string) => ({ children: [text(value)], type: 'paragraph' });
const quote = (...children: readonly object[]) => ({
  children,
  type: 'blockquote',
});
const bare: EmptyTextRead = () => ({ text: '' });
const weighted: EmptyTextRead = () => ({ text: '', weight: 400 });

const retract = (
  before: readonly object[],
  sections: (index: DocumentIndex) => RootChangeSection[],
  readEmpty = bare
) => {
  const index = DocumentIndex.fromValue(before as readonly JsonNode[]);

  return retractionOf(
    index,
    RootChange.create(index, sections(index)),
    readEmpty
  );
};
const slice = (...nodes: readonly object[]) =>
  PreparedTokenSlice.fromNodes(nodes as readonly JsonNode[]);

describe('retractionOf refuses what a retraction cannot store', () => {
  it('refuses a section that inserts a letter', () => {
    assert.equal(
      retract([p('ab')], (index) => [
        { ...index.nodeRange([0, 0]), insert: slice(text('x')) },
      ]),
      null
    );
  });

  it('refuses a section that inserts an element', () => {
    assert.equal(
      retract([p('a')], (index) => {
        const at = index.childPosition([0], 1);

        return [
          {
            from: at,
            insert: slice({ children: [text('')], type: 'link' }, text('')),
            to: at,
          },
        ];
      }),
      null
    );
  });

  it('refuses a section that removes an element’s opening bracket alone', () => {
    assert.equal(
      retract([p('a'), p('b')], (index) => {
        const { from } = index.nodeRange([1]);

        return [{ from, to: from + 1 }];
      }),
      null
    );
  });

  it('refuses a section that removes an element’s closing bracket alone', () => {
    assert.equal(
      retract([p('a'), p('b')], (index) => {
        const { to } = index.nodeRange([0]);

        return [{ from: to - 1, to }];
      }),
      null
    );
  });

  it('accepts an emptied element’s text only as storage reads an element with none', () => {
    const emptied = (index: DocumentIndex) => [
      {
        from: index.childPosition([0], 0),
        insert: slice(text('')),
        to: index.childPosition([0], 1),
      },
    ];

    assert.deepEqual(
      [
        retract([quote(p('a'))], emptied, weighted),
        retract([quote(p('a'))], emptied, bare),
      ],
      [null, { blocks: [0], characters: [], elements: [[0, 0]] }]
    );
  });
});
