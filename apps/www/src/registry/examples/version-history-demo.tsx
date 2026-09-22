'use client';

import type { EditorStateSchemaApi, Value } from 'platejs';
import {
  type AuthoredChange,
  type AuthoredPlugin,
  authored,
} from 'platejs/authored';
import { compare, type TwoWayComparison } from 'platejs/diff';
import {
  type Editor,
  EditorRoot,
  EditorContent,
  useCreateEditor,
  useEditor,
  useEditorSelector,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { Diff } from '@/registry/components/editor/diff';

type VersionHistoryEditor = Editor<Value, readonly [AuthoredPlugin]>;

const readPlateUserId = (editor: object) => {
  const runtime = Reflect.get(editor, 'runtime');
  if (!runtime || typeof runtime !== 'object') return null;
  const userId = Reflect.get(runtime, 'userId');

  return typeof userId === 'string' && userId.length > 0 ? userId : null;
};

const initialValue: Value = [
  {
    children: [{ text: 'This document keeps each accepted edit by author.' }],
    type: 'paragraph',
  },
  {
    children: [
      { text: 'Edit this text as Alice or Bob, then revert one contribution.' },
    ],
    type: 'paragraph',
  },
];

const sameChanges = (
  left: readonly AuthoredChange[] | null,
  right: readonly AuthoredChange[]
) =>
  left !== null &&
  left.length === right.length &&
  left.every(
    (change, index) =>
      change.id === right[index]?.id &&
      change.revision === right[index]?.revision &&
      change.status === right[index]?.status
  );

function AuthorHistory({ onResult }: { onResult: (value: string) => void }) {
  const editor = useEditor() as VersionHistoryEditor;
  const changes = useEditorSelector(
    (current) =>
      (current as VersionHistoryEditor).read.authored.changes({
        limit: 50,
        status: 'accepted',
      }).items,
    { equalityFn: sameChanges }
  );

  if (changes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Accepted edits appear here after you change the document.
      </p>
    );
  }

  return (
    <ol
      className="max-h-48 space-y-2 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:var(--border)_transparent] [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
      data-testid="author-history"
    >
      {changes.toReversed().map((change) => (
        <li
          className="flex items-center justify-between gap-3 rounded-md border p-2"
          key={`${change.id}:${change.revision}`}
        >
          <span className="text-sm">
            <strong>{change.authorId}</strong> · {change.kind} · revision{' '}
            {change.revision}
          </span>
          <Button
            onClick={() => {
              const result = editor.update.authored.revert({
                selection: editor.read.authored.select({ ids: [change.id] }),
              });

              onResult(
                result.status === 'applied'
                  ? `Reverted ${change.authorId}'s ${change.kind} change.`
                  : `Revert ${result.status}.`
              );
            }}
            size="sm"
            variant="outline"
          >
            Revert
          </Button>
        </li>
      ))}
    </ol>
  );
}

export function VersionDiff({
  after,
  before,
  schema,
}: {
  after: unknown;
  before: unknown;
  schema: EditorStateSchemaApi;
}) {
  const [result, setResult] = React.useState<{
    after: unknown;
    comparison: TwoWayComparison | null;
    error: string | null;
  } | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    void compare({ after, before, schema, signal: controller.signal }).then(
      (comparison) => {
        if (!controller.signal.aborted) {
          setResult({ after, comparison, error: null });
        }
      },
      (error: unknown) => {
        if (
          !controller.signal.aborted &&
          !(error instanceof Error && error.name === 'AbortError')
        ) {
          setResult({
            after,
            comparison: null,
            error:
              error instanceof Error ? error.message : 'Comparison failed.',
          });
        }
      }
    );

    return () => controller.abort();
  }, [after, before, schema]);

  if (result && result.after === after && result.error) {
    return (
      <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-950">
        {result.error}
      </p>
    );
  }
  if (!result || result.after !== after || !result.comparison) {
    return (
      <p aria-live="polite" className="rounded-md border p-3 text-sm">
        Comparing revisions…
      </p>
    );
  }

  return <Diff comparison={result.comparison} />;
}

function RevisionHistory() {
  const editor = useEditor() as VersionHistoryEditor;
  const [revisions, setRevisions] = React.useState<readonly unknown[]>(() => [
    structuredClone(editor.read.value()),
  ]);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">Saved revisions</h2>
        <Button
          onClick={() =>
            setRevisions((current) => [
              ...current,
              structuredClone(editor.read.value()),
            ])
          }
          size="sm"
          variant="outline"
        >
          Save revision
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Edit the document and save a revision to compare it with the previous
        snapshot.
      </p>
      {revisions.length > 1 && (
        <VersionDiff
          after={revisions.at(-1)}
          before={revisions.at(-2)}
          schema={editor.read.schema}
        />
      )}
    </section>
  );
}

export default function VersionHistoryDemo() {
  const [authorId, setAuthorId] = React.useState('alice');
  const [result, setResult] = React.useState('');
  const editor = useCreateEditor({
    plugins: [
      ...BasicMarksKit,
      authored({
        authorId: readPlateUserId,
        retainHistory: true,
      }),
    ],
    initialValue,
    userId: 'alice',
  });

  return (
    <div className="flex flex-col gap-4 p-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        Edit as
        <select
          className="rounded-md border bg-background px-2 py-1"
          onChange={(event) => {
            Reflect.set(editor.runtime, 'userId', event.target.value);
            setAuthorId(event.target.value);
          }}
          value={authorId}
        >
          <option value="alice">Alice</option>
          <option value="bob">Bob</option>
        </select>
      </label>

      <EditorRoot editor={editor}>
        <EditorContent className="rounded-md border p-3" />
        <section className="space-y-2">
          <h2 className="font-medium">Retained author history</h2>
          <AuthorHistory onResult={setResult} />
          {result && (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {result}
            </p>
          )}
        </section>
        <RevisionHistory />
      </EditorRoot>
    </div>
  );
}
