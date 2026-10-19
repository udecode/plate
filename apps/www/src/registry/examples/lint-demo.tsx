'use client';

import { BaseLintPlugin, type LintRule } from 'platejs/lint';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
  usePluginStore,
} from 'platejs/react';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import {
  commaSpacing,
  fillerWords,
  isProse,
  LintKit,
  useLintFindings,
} from '@/registry/components/editor/lint';
import { EditorKit } from '@/registry/components/editor/plugins';

const SERVER_DELAY = 600;
const TERMS = [
  { pattern: /\be-mail\b/gi, fix: 'email' },
  { pattern: /\bweb site\b/gi, fix: 'website' },
];

// A stand-in for a server check: it runs in this page and answers after
// SERVER_DELAY milliseconds.
const reviewTerminology = (text: string, signal: AbortSignal) =>
  new Promise<Array<{ end: number; fix: string; start: number }>>((resolve) => {
    const timer = setTimeout(() => {
      resolve(
        TERMS.flatMap(({ fix, pattern }) =>
          Array.from(text.matchAll(pattern), (match) => ({
            end: match.index + match[0].length,
            fix,
            start: match.index,
          }))
        )
      );
    }, SERVER_DELAY);

    signal.addEventListener('abort', () => clearTimeout(timer), {
      once: true,
    });
  });

const terminology: LintRule = {
  id: 'server/terminology',
  severity: 'info',
  check: async (text, { block, editor, signal }) => {
    if (!isProse(editor, block)) return [];

    const terms = await reviewTerminology(text, signal);

    return terms.map(({ end, fix, start }) => ({
      start,
      end,
      message: `Write "${fix}".`,
      fixes: [fix],
    }));
  },
};

const localRules = [fillerWords, commaSpacing];

function LintPanel() {
  const editor = useEditor();
  const lint = editor.plugin(BaseLintPlugin);
  const findings = useLintFindings();
  const error = usePluginStore(BaseLintPlugin, 'error');
  const firstFixable = findings.find((finding) => finding.fixes.length > 0);

  return (
    <aside
      aria-label="Lint findings"
      className="flex max-h-[352px] flex-col gap-3 overflow-y-auto rounded-md border p-4 @4xl:max-h-[650px]"
      data-slot="lint-panel"
    >
      {/* Pressing these keeps focus and the caret in the editor. */}
      <div
        aria-label="Lint actions"
        className="flex flex-wrap gap-2"
        onMouseDown={(event) => event.preventDefault()}
        role="toolbar"
        tabIndex={-1}
      >
        <Button
          onClick={() => lint.api.run(localRules)}
          size="sm"
          variant="outline"
        >
          Run linter
        </Button>
        <Button
          onClick={() => lint.api.run([...localRules, terminology])}
          size="sm"
          variant="outline"
        >
          Check with server
        </Button>
        <Button onClick={() => lint.api.clear()} size="sm" variant="outline">
          Clear
        </Button>
        <Button
          disabled={!firstFixable}
          onClick={() => {
            if (firstFixable) lint.update.fix(firstFixable.id);
          }}
          size="sm"
        >
          Apply first fix
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Check with server adds a rule served by a stand-in in this page, which
        answers after {SERVER_DELAY} ms.
      </p>
      <p aria-live="polite" className="text-sm font-medium" role="status">
        {findings.length === 1 ? '1 issue' : `${findings.length} issues`}
      </p>
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <ol className="flex flex-col gap-1">
        {findings.slice(0, 50).map((finding) => (
          <li key={finding.id}>
            <button
              className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
              data-severity={finding.severity}
              onClick={() => {
                lint.update.select(finding.id);
                editor.api.dom.focus();
              }}
              type="button"
            >
              <span className="font-medium">{finding.text.trim()}</span>{' '}
              <span className="text-muted-foreground">{finding.message}</span>
            </button>
          </li>
        ))}
      </ol>
      {findings.length > 50 && (
        <p className="text-xs text-muted-foreground">
          Showing the first 50 of {findings.length}.
        </p>
      )}
    </aside>
  );
}

export default function LintDemo() {
  const locale = useLocale();
  const editor = useCreateEditor(
    {
      plugins: [...EditorKit, ...LintKit],
      initialValue: getI18nValues(locale).lint,
    },
    []
  );

  return (
    <EditorRoot editor={editor}>
      <div className="@container">
        <div className="grid grid-cols-1 gap-4 p-4 @4xl:grid-cols-[minmax(0,1fr)_20rem]">
          <EditorFrame className="h-[480px] @4xl:h-[650px]">
            <EditorContainer aria-label="Linted document" role="region">
              <Editor aria-label="Linted editor" />
            </EditorContainer>
          </EditorFrame>
          <LintPanel />
        </div>
      </div>
    </EditorRoot>
  );
}
