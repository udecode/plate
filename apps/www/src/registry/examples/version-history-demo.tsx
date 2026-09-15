'use client';

import type { Value } from 'platejs';
import {
  type AuthoredChange,
  type AuthoredPlugin,
  authored,
} from 'platejs/authored';
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
    <ol className="space-y-2">
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
      </EditorRoot>
    </div>
  );
}
