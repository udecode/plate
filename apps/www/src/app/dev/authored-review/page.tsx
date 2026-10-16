'use client';

import { useSearchParams } from 'next/navigation';
import { schema } from 'platejs';
import {
  type AuthoredChange,
  AuthoredPlugin,
  projectAuthoredDocument,
} from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  EditorContent,
  EditorRoot,
  HeadingPlugin,
  createEditor,
  definePlugin,
} from 'platejs/react';
import { suggestionColorOf } from 'platejs/suggestion';
import React, { Suspense } from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { CodeBlockKit } from '@/registry/components/editor/code-block';
import { ColumnKit } from '@/registry/components/editor/column';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { LinkKit } from '@/registry/components/editor/link';
import { ListKit } from '@/registry/components/editor/list';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { TableKit } from '@/registry/components/editor/table';

// Proof route for Phase 1 of docs/plans/2026-10-08-authored-review.md, with a
// `values` fixture for docs/plans/2026-10-10-authored-values.md's S8, `fill`
// and `title` fixtures for T9 of docs/plans/2026-10-11-authored-fill.md, and
// a `page` fixture with /docs/suggestion's plugins for P1.1 of
// docs/plans/2026-10-12-suggestions-complete.md, on the production authored
// plugin. `?intent=plain` mounts the same editor without it, as the plain side
// of a comparison.

type Gesture = 'removeCell' | 'removeTitle' | 'unwrapGroup';
type Intent = 'edit' | 'plain' | 'propose';

const INTENTS: readonly Intent[] = ['edit', 'plain', 'propose'];
const isIntent = (value: string): value is Intent =>
  INTENTS.some((intent) => intent === value);

declare global {
  interface Window {
    /** Decision and intent controls the route's browser spec drives. */
    authoredProof?: {
      cardOf: (change: string) => { id: string; slot: number } | null;
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
      /** Replace the document, outside history, with another page's value. */
      load: (children: readonly unknown[]) => void;
      /** The document with every pending change accepted or rejected, uncommitted. */
      project: (projection: 'accepted' | 'proposed') => unknown[];
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

const pageFixture = [
  { type: 'paragraph', children: [{ text: 'First line' }] },
  { type: 'paragraph', children: [{ text: 'Second line' }] },
  { type: 'paragraph', children: [{ text: 'Last line' }] },
];

const fixtures = {
  fill: fillFixture,
  page: pageFixture,
  review: pageFixture,
  title: titleFixture,
  values: valuesFixture,
} as const;

const reviewers = {
  alice: { id: 'alice', name: 'Alice' },
  bob: { id: 'bob', name: 'Bob' },
  carol: { id: 'carol', name: 'Carol' },
};

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
  const [{ editor, proof, review }] = React.useState(() => {
    const intent = params?.get('intent') ?? 'edit';

    if (!isIntent(intent)) {
      throw new Error(`Unknown intent "${intent}".`);
    }

    const plugin = intent === 'plain' ? null : AuthoredPlugin;
    const fixture = params?.get('fixture');
    const basic = fixture === 'review' || fixture === 'page';
    const kits = [
      ...(basic || fixture === 'title' ? BasicBlocksKit : []),
      ...(basic
        ? []
        : [...TableKit, ...ColumnKit, ...ListKit, ...CodeBlockKit, ...LinkKit]),
      ...BasicMarksKit,
      ...(fixture === 'review'
        ? [
            ...SuggestionKit,
            ...DiscussionKit,
            CommentsPlugin.configure({ initialState: { users: reviewers } }),
          ]
        : [...(basic ? [] : [FillGridPlugin]), AuthoredPaint]),
    ];

    const created = createEditor({
      initialValue:
        fixture && Object.hasOwn(fixtures, fixture)
          ? fixtures[fixture as keyof typeof fixtures]
          : initialValue,
      plugins: [...kits, ...(plugin ? [plugin] : [])],
      userId: (fixture === 'review' && params?.get('user')) || 'alice',
      ...(fixture === 'title' ? { schema: { root: titleRoot } } : {}),
    });

    if (plugin && intent !== 'plain') {
      created.plugin(plugin).api.setView({ intent });
    }

    return { editor: created, proof: plugin, review: fixture === 'review' };
  });

  React.useEffect(() => {
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
    const load = (children: readonly unknown[]) =>
      editor.update((tx) => {
        // Recorded as a remote replacement, so no recorder rewrites it.
        tx.tags.add('collaboration');
        tx.history.skip();
        tx.value.replace({ children } as never);
      });

    if (!proof) {
      const missing = () => {
        throw new Error('The plain editor has no review tree.');
      };

      window.authoredProof = {
        cardOf: missing,
        decide: missing,
        gesture,
        load,
        project: missing,
        setIntent: missing,
      };
      return;
    }

    const authored = editor.plugin(proof);
    // An id the document no longer holds decides as stale.
    const changeOf = (id: string): AuthoredChange =>
      authored.read.change(id) ?? {
        authorId: '',
        createdAt: 0,
        id,
        kind: 'insert',
        ranges: [],
        revision: -1,
      };

    window.authoredProof = {
      cardOf: (change) => {
        const card = authored.read.groupOf(change);

        return card ? { id: card.id, slot: suggestionColorOf(card.id) } : null;
      },
      decide: (decisions) =>
        authored.update.decide(
          [decisions].flat().map((decision) => ({
            action: decision.action,
            changes: decision.changes.map(changeOf),
          }))
        ),
      gesture,
      load,
      project: (projection) => {
        const projected = projectAuthoredDocument(editor.read.value(), {
          editor,
          projection,
        });
        if (!projected.ok) throw new Error('This schema generates values.');

        return [...projected.document.children];
      },
      setIntent: (intent) => authored.api.setView({ intent }),
    };
  }, [editor, proof]);

  return (
    <main className="p-8" data-authored-proof="ready">
      <EditorRoot editor={editor}>
        {review ? (
          <EditorContainer>
            <Editor aria-label="Review document" variant="demo" />
          </EditorContainer>
        ) : (
          <EditorContent className="max-w-3xl outline-none" />
        )}
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
