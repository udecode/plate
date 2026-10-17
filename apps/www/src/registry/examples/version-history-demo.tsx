'use client';

import type { EditorStateSchemaApi, Value } from 'platejs';
import { compare, type TwoWayComparison } from 'platejs/diff';
import {
  EditorRoot,
  EditorContent,
  useCreateEditor,
  useEditor,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { Diff } from '@/registry/components/editor/diff';

type Revision = ReturnType<ReturnType<typeof useEditor>['read']['value']>;
type SavedRevision = Readonly<{ id: number; value: Revision }>;

const initialValue: Value = [
  {
    children: [{ text: 'Save a revision after each edit to compare them.' }],
    type: 'paragraph',
  },
  {
    children: [{ text: 'Edit this text, then save a revision.' }],
    type: 'paragraph',
  },
];

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

function RevisionHistory({
  onSave,
  revisions,
}: {
  onSave: (revision: Revision) => void;
  revisions: readonly SavedRevision[];
}) {
  const editor = useEditor();

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">Saved revisions</h2>
        <Button
          onClick={() => onSave(structuredClone(editor.read.value()))}
          size="sm"
          variant="outline"
        >
          Save revision
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Edit the document and save a revision to compare it with the previous
        snapshot, or restore any saved revision.
      </p>
      <ol className="space-y-1 text-sm">
        {revisions.map(({ id, value }, index) => (
          <li className="flex items-center justify-between gap-3" key={id}>
            <span>Revision {index + 1}</span>
            <Button
              aria-label={`Restore revision ${index + 1}`}
              onClick={() => editor.update((tx) => tx.value.replace(value))}
              size="sm"
              variant="ghost"
            >
              Restore
            </Button>
          </li>
        ))}
      </ol>
      {revisions.length > 1 && (
        <VersionDiff
          after={revisions.at(-1)?.value}
          before={revisions.at(-2)?.value}
          schema={editor.read.schema}
        />
      )}
    </section>
  );
}

export default function VersionHistoryDemo() {
  const editor = useCreateEditor({
    plugins: BasicMarksKit,
    initialValue,
  });
  const [revisions, setRevisions] = React.useState<readonly SavedRevision[]>(
    () => [{ id: 0, value: structuredClone(editor.read.value()) }]
  );

  return (
    <div className="flex flex-col gap-4 p-3">
      <EditorRoot editor={editor}>
        <EditorContent className="rounded-md border p-3" />
        <RevisionHistory
          onSave={(revision) =>
            setRevisions((current) => [
              ...current,
              { id: current.length, value: revision },
            ])
          }
          revisions={revisions}
        />
      </EditorRoot>
    </div>
  );
}
