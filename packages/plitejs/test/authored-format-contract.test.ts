import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { EditorDocumentValue } from 'plitejs';
import {
  projectAuthoredDocument,
  projectAuthoredRange,
} from 'plitejs/authored';

const mark = (change: string, kind: 'delete' | 'insert') => ({
  at: 1,
  author: 'carol',
  change,
  kind,
});
const line = (...children: object[]) => ({ children, type: 'paragraph' });

// "A" then "BC" struck, "X" inserted, "DE" kept.
const reviewed = (
  children: object[] = [
    { text: 'A' },
    { authored: [mark('carol:1', 'delete')], text: 'BC' },
    { authored: [mark('carol:2', 'insert')], text: 'X' },
    { text: 'DE' },
  ]
) => ({ children: [line(...children)] }) as unknown as EditorDocumentValue;
const at = (path: number[], offset: number) => ({ offset, path });

describe('authored document projections', () => {
  it('rejects or accepts every pending change and warns that it decided them', () => {
    const accepted = projectAuthoredDocument(reviewed(), {
      projection: 'accepted',
    });
    const proposed = projectAuthoredDocument(reviewed(), {
      projection: 'proposed',
    });

    assert.deepEqual(accepted.document.children, [line({ text: 'ABCDE' })]);
    assert.deepEqual(proposed.document.children, [line({ text: 'AXDE' })]);
    assert.deepEqual(
      [accepted.pending, accepted.diagnostics],
      [
        2,
        [
          {
            code: 'authored-lossy-projection',
            message: 'The accepted projection decides 2 pending changes.',
            severity: 'warning',
          },
        ],
      ]
    );
  });

  it('projects a document without pending changes without a warning', () => {
    const plain = projectAuthoredDocument(reviewed([{ text: 'ABC' }]), {
      projection: 'proposed',
    });

    assert.deepEqual(
      [plain.document.children, plain.pending, plain.diagnostics],
      [[line({ text: 'ABC' })], 0, []]
    );
  });

  it('maps a stored range onto a projection, keeping its direction', () => {
    const stored = reviewed();
    const { document: accepted } = projectAuthoredDocument(stored, {
      projection: 'accepted',
    });
    const { document: proposed } = projectAuthoredDocument(stored, {
      projection: 'proposed',
    });

    assert.deepEqual(
      projectAuthoredRange(stored, accepted, {
        anchor: at([0, 3], 0),
        focus: at([0, 3], 2),
      }),
      { anchor: at([0, 0], 3), focus: at([0, 0], 5) }
    );
    assert.deepEqual(
      projectAuthoredRange(stored, proposed, {
        anchor: at([0, 3], 2),
        focus: at([0, 0], 0),
      }),
      { anchor: at([0, 0], 4), focus: at([0, 0], 0) }
    );
  });

  it('maps a range over content the projection drops to null', () => {
    const stored = reviewed();
    const { document: proposed } = projectAuthoredDocument(stored, {
      projection: 'proposed',
    });

    assert.equal(
      projectAuthoredRange(stored, proposed, {
        anchor: at([0, 1], 0),
        focus: at([0, 1], 2),
      }),
      null
    );
  });
});
