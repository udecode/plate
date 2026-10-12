'use client';

import { useSearchParams } from 'next/navigation';
import { schema } from 'platejs';
import {
  EditorContent,
  EditorRoot,
  HeadingPlugin,
  createEditor,
  definePlugin,
} from 'platejs/react';
import { authoredTreeProof } from 'plitejs/authored';
import React, { Suspense } from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { CodeBlockKit } from '@/registry/components/editor/code-block';
import { ColumnKit } from '@/registry/components/editor/column';
import { LinkKit } from '@/registry/components/editor/link';
import { ListKit } from '@/registry/components/editor/list';
import { TableKit } from '@/registry/components/editor/table';

// Proof route for Phase 1 of docs/plans/2026-10-08-authored-review.md, with a
// `values` fixture for docs/plans/2026-10-10-authored-values.md's S8, and
// `fill` and `title` fixtures for T9 of docs/plans/2026-10-11-authored-fill.md.

type Gesture = 'removeCell' | 'removeTitle' | 'unwrapGroup';

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
      /** A structural edit no key press makes. */
      gesture: (name: Gesture) => void;
      setIntent: (intent: 'edit' | 'propose') => void;
    };
  }
}

type Mark = { author: string; change: string; kind: string };
type FixtureNode = { children?: FixtureNode[]; text?: string; type?: string };

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

// A grid holds at least two cells, and a cell may stand alone once its grid
// unwraps, as in the fill plan's probes.
const FillCellPlugin = definePlugin('fillCell', {
  schema: { element: schema.element.textBlock() },
});
const FillGridPlugin = definePlugin('fillGrid', {
  dependencies: [FillCellPlugin],
  schema: {
    element: {
      content: schema.content.element(FillCellPlugin, { min: 2 }),
    },
  },
});

const fillFixture = [
  { type: 'paragraph', children: [{ text: 'First line' }] },
  { type: 'paragraph', children: [{ bold: true, text: 'Bold line' }] },
  { type: 'paragraph', children: [{ text: '' }] },
  {
    type: 'fillGrid',
    children: [
      { type: 'fillCell', children: [{ text: 'a' }] },
      { type: 'fillCell', children: [{ text: 'b' }] },
    ],
  },
  { type: 'paragraph', children: [{ text: 'Last line' }] },
];

const titleFixture = [
  { type: 'heading', level: 1, children: [{ text: 'Title' }] },
  { type: 'paragraph', children: [{ text: 'Body' }] },
];

// The document must open with a level-one heading.
const titleRoot = schema.content.prefix(
  [{ element: HeadingPlugin, properties: { level: 1 } }],
  schema.content.group('block', { default: { type: 'paragraph' }, min: 1 })
);

const fixtures = {
  fill: fillFixture,
  title: titleFixture,
  values: valuesFixture,
} as const;

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
        : kinds.includes('format')
          ? { backgroundColor: '#fef9c3' }
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
    const fixture = params?.get('fixture');

    return {
      editor: createEditor({
        initialValue:
          fixture && Object.hasOwn(fixtures, fixture)
            ? fixtures[fixture as keyof typeof fixtures]
            : initialValue,
        plugins: [
          ...(fixture === 'title' ? BasicBlocksKit : []),
          ...TableKit,
          ...ColumnKit,
          ...ListKit,
          ...CodeBlockKit,
          ...LinkKit,
          ...BasicMarksKit,
          FillGridPlugin,
          AuthoredPaint,
          plugin,
        ],
        ...(fixture === 'title' ? { schema: { root: titleRoot } } : {}),
      }),
      proof: plugin,
    };
  });

  React.useEffect(() => {
    const { api } = editor.plugin(proof);
    const targets: Record<Gesture, (node: FixtureNode) => boolean> = {
      removeCell: (node) =>
        node.type === 'fillCell' && node.children?.[0]?.text === 'a',
      removeTitle: (node) => node.type === 'heading',
      unwrapGroup: (node) => node.type === 'fillGrid',
    };
    const gesture = (name: Gesture) =>
      editor.update((tx) => {
        const found = tx.nodes.find({ at: [], match: targets[name] as never });

        if (!found) throw new Error(`No node for ${name}.`);
        if (name === 'unwrapGroup') tx.nodes.unwrap({ at: found[1] });
        else tx.nodes.remove({ at: found[1] });
      });

    window.authoredProof = {
      decide: api.decide,
      gesture,
      setIntent: api.setIntent,
    };
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
