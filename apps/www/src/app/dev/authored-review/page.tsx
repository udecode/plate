'use client';

import { useSearchParams } from 'next/navigation';
import {
  EditorContent,
  EditorRoot,
  createEditor,
  definePlugin,
} from 'platejs/react';
import { authoredTreeProof } from 'plitejs/authored';
import React, { Suspense } from 'react';

import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { CodeBlockKit } from '@/registry/components/editor/code-block';
import { ColumnKit } from '@/registry/components/editor/column';
import { LinkKit } from '@/registry/components/editor/link';
import { ListKit } from '@/registry/components/editor/list';
import { TableKit } from '@/registry/components/editor/table';

// Proof route for Phase 1 of docs/plans/2026-10-08-authored-review.md, with a
// `values` fixture for docs/plans/2026-10-10-authored-values.md's S8.

declare global {
  interface Window {
    /** Decision and intent controls the route's browser spec drives. */
    authoredProof?: {
      decide: (
        decisions:
          | { action: 'accept' | 'reject'; changes: readonly string[] }
          | ReadonlyArray<{
              action: 'accept' | 'reject';
              changes: readonly string[];
            }>
      ) => unknown;
      setIntent: (intent: 'edit' | 'propose') => void;
    };
  }
}

type Mark = { author: string; change: string; kind: string };

const bob = (kind: string, change: string) => ({
  at: 1,
  author: 'bob',
  change,
  kind,
});

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: 'Alpha ' },
      { authored: [bob('delete', 'bob:1')], text: 'gone' },
      { text: ' beta ' },
      { authored: [bob('insert', 'bob:2')], text: 'theirs' },
      { text: ' gamma' },
    ],
  },
  {
    type: 'paragraph',
    authored: [bob('delete', 'bob:3')],
    children: [{ authored: [bob('delete', 'bob:3')], text: 'Struck block' }],
  },
  { type: 'paragraph', children: [{ text: 'Plain line' }] },
];

// A link to split, and a word Bob's pending suggestion bolded.
const valuesFixture = [
  {
    type: 'paragraph',
    children: [
      { text: 'Alpha ' },
      {
        children: [{ text: 'Link here' }],
        type: 'link',
        url: 'https://plate.test',
      },
      { text: ' and ' },
      {
        authored: [
          {
            at: 1,
            author: 'bob',
            change: 'bob:9',
            id: 'bob-bold',
            key: 'bold',
            kind: 'format',
          },
        ],
        bold: true,
        text: 'bolded',
      },
      { text: ' end' },
    ],
  },
];

const paint = (marks: readonly Mark[] | undefined) => {
  if (!marks?.length) return null;
  const kinds = [...new Set(marks.map((mark) => mark.kind))];

  return {
    'data-authored': kinds.join(' '),
    'data-authored-changes': marks.map((mark) => mark.change).join(' '),
    style: kinds.includes('delete')
      ? { color: '#b91c1c', textDecoration: 'line-through' }
      : kinds.includes('insert')
        ? { color: '#15803d', textDecoration: 'underline' }
        : {},
  };
};

const AuthoredPaint = definePlugin('authoredPaint', {
  inject: {
    nodeProps: {
      nodeKey: 'authored',
      transformProps: ({ nodeValue, props }) => {
        const painted = paint(nodeValue as Mark[] | undefined);

        return painted
          ? {
              ...props,
              ...painted,
              style: { ...props.style, ...painted.style },
            }
          : props;
      },
    },
  },
});

function AuthoredReviewProof() {
  const params = useSearchParams();
  const [{ editor, proof }] = React.useState(() => {
    const plugin = authoredTreeProof({
      authorId: 'alice',
      intent: params?.get('intent') === 'propose' ? 'propose' : 'edit',
    });

    return {
      editor: createEditor({
        initialValue:
          params?.get('fixture') === 'values' ? valuesFixture : initialValue,
        plugins: [
          ...TableKit,
          ...ColumnKit,
          ...ListKit,
          ...CodeBlockKit,
          ...LinkKit,
          ...BasicMarksKit,
          AuthoredPaint,
          plugin,
        ],
      }),
      proof: plugin,
    };
  });

  React.useEffect(() => {
    const { api } = editor.plugin(proof);

    window.authoredProof = { decide: api.decide, setIntent: api.setIntent };
  }, [editor, proof]);

  return (
    <main className="p-8" data-authored-proof="ready">
      <EditorRoot editor={editor}>
        <EditorContent className="max-w-3xl outline-none" />
      </EditorRoot>
    </main>
  );
}

export default function AuthoredReviewPage() {
  return (
    <Suspense fallback={<p>Loading authored review proof…</p>}>
      <AuthoredReviewProof />
    </Suspense>
  );
}
