import { cva } from 'class-variance-authority';
import { useState } from 'react';
import { type EditorSnapshot, NodeApi, type Range } from '@platejs/slate';
import {
  Editable,
  Slate,
  type SlateRangeDecoration,
  useEditor,
  useEditorState,
  useSlateEditor,
  useSlateRangeDecorationSource,
} from '@platejs/slate-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { Instruction } from './components';

type LintSeverity = 'error' | 'info' | 'warning';

type LintIssue = {
  id: string;
  message: string;
  ruleId: string;
  severity: LintSeverity;
  fixText?: string;
};

type LintMode = 'local' | 'off' | 'server';

type LintIssueDecoration = {
  data: LintIssue;
  key: string;
  range: Range;
};

const NO_LINT_ISSUES: readonly LintIssueDecoration[] = [];

const lintSegmentVariants = cva('slate-linting-segment', {
  variants: {
    severity: {
      error: 'slate-linting-segment-error',
      info: 'slate-linting-segment-info',
      warning: 'slate-linting-segment-warning',
    },
  },
});

const rootFor = (snapshot: EditorSnapshot) => ({
  children: snapshot.children,
});

const keyFor = (ruleId: string, range: Range) =>
  `${ruleId}:${range.anchor.path.join('.')}:${range.anchor.offset}`;

const createIssue = (
  range: Range,
  issue: Omit<LintIssue, 'id'>
): LintIssueDecoration => {
  const id = keyFor(issue.ruleId, range);

  return {
    data: {
      ...issue,
      id,
    },
    key: id,
    range,
  };
};

const collectLintIssues = (
  snapshot: EditorSnapshot,
  {
    includeServerDiagnostics = false,
  }: {
    includeServerDiagnostics?: boolean;
  } = {}
): LintIssueDecoration[] => {
  const root = rootFor(snapshot);
  const issues: LintIssueDecoration[] = [];

  issues.push(
    ...NodeApi.findTextRanges(
      root,
      /\b(obviously|clearly|evidently|simply)\b/gi
    ).map((range) =>
      createIssue(range, {
        message: 'Avoid filler words in product copy.',
        ruleId: 'style-filler-word',
        severity: 'warning',
      })
    )
  );

  issues.push(
    ...NodeApi.findTextRanges(root, / , ?/g).map((range) =>
      createIssue(range, {
        fixText: ', ',
        message: 'Remove the space before commas.',
        ruleId: 'comma-spacing',
        severity: 'error',
      })
    )
  );

  if (includeServerDiagnostics) {
    issues.push(
      ...NodeApi.findTextRanges(root, 'server diagnostics', {
        caseSensitive: false,
      }).map((range) =>
        createIssue(range, {
          message: 'Server rule prefers "remote lint results" here.',
          ruleId: 'server-terminology',
          severity: 'info',
        })
      )
    );
  }

  return issues;
};

const formatIssues = (issues: readonly LintIssueDecoration[]) =>
  issues.length === 0
    ? 'none'
    : issues
        .map((issue) => `${issue.data.ruleId}:${issue.data.severity}`)
        .join('|');

const getSegmentIssue = (
  slices: readonly { data?: unknown }[]
): LintIssue | null => {
  const issues = slices
    .map((slice) => slice.data as LintIssue | undefined)
    .filter((issue): issue is LintIssue => Boolean(issue));

  return (
    issues.find((issue) => issue.severity === 'error') ??
    issues.find((issue) => issue.severity === 'warning') ??
    issues[0] ??
    null
  );
};

const LintingPanel = ({
  lintMode,
  setLintMode,
  setSourceLabel,
  sourceLabel,
}: {
  lintMode: LintMode;
  setLintMode: (mode: LintMode) => void;
  setSourceLabel: (label: string) => void;
  sourceLabel: string;
}) => {
  const editor = useEditor();
  const diagnostics = useEditorState(
    (state) =>
      lintMode === 'off'
        ? NO_LINT_ISSUES
        : collectLintIssues(state.runtime.snapshot(), {
            includeServerDiagnostics: lintMode === 'server',
          }),
    { deps: [lintMode] }
  );

  const collectFromEditor = (mode: LintMode) =>
    mode === 'off'
      ? NO_LINT_ISSUES
      : collectLintIssues(
          editor.read((state) => state.runtime.snapshot()),
          {
            includeServerDiagnostics: mode === 'server',
          }
        );

  const runLocalLint = () => {
    setLintMode('local');
    setSourceLabel('local');
  };

  const applyFirstFix = () => {
    const mode = lintMode === 'off' ? 'local' : lintMode;
    const fix = collectFromEditor(mode).find(
      (diagnostic) => diagnostic.data.fixText
    );

    const fixText = fix?.data.fixText;

    if (!fixText) {
      return;
    }

    editor.update((tx) => {
      tx.text.delete({ at: fix.range });
      tx.text.insert(fixText, { at: fix.range.anchor });
    });
    setLintMode(mode);
    setSourceLabel('fixed');
  };

  const receiveServerDiagnostics = () => {
    setLintMode('server');
    setSourceLabel('server');
  };

  const clearDiagnostics = () => {
    setLintMode('off');
    setSourceLabel('cleared');
  };

  return (
    <div className="slate-linting-panel">
      <Instruction>
        This linter keeps findings outside the Slate document.{' '}
        <code>useSlateRangeDecorationSource</code> reads the current editor
        snapshot, maps lint findings to ranges, and refreshes on text edits or
        external source changes.
      </Instruction>
      <div className="slate-linting-controls">
        <Button onClick={runLocalLint} type="button" variant="outline">
          Run linter
        </Button>
        <Button
          disabled={!diagnostics.some((diagnostic) => diagnostic.data.fixText)}
          onClick={applyFirstFix}
          type="button"
          variant="outline"
        >
          Apply first fix
        </Button>
        <Button
          onClick={receiveServerDiagnostics}
          type="button"
          variant="outline"
        >
          Receive server diagnostics
        </Button>
        <Button onClick={clearDiagnostics} type="button" variant="outline">
          Clear diagnostics
        </Button>
      </div>
      <div className="slate-linting-status">
        <span className="slate-linting-code" id="linting-source">
          source:{sourceLabel}
        </span>
        <span className="slate-linting-code" id="linting-count">
          issues:{diagnostics.length}
        </span>
        <span className="slate-linting-code" id="linting-snapshot">
          {formatIssues(diagnostics)}
        </span>
      </div>
      <ul className="slate-linting-issue-list" id="linting-issues">
        {diagnostics.map((diagnostic) => (
          <li
            className="slate-linting-issue"
            data-lint-issue={diagnostic.data.id}
            key={diagnostic.data.id}
          >
            <strong>{diagnostic.data.severity}</strong>:{' '}
            {diagnostic.data.message}
          </li>
        ))}
      </ul>
      <Editable
        className="slate-linting-editor"
        id="linting"
        renderSegment={(segment, children) => {
          const issue = getSegmentIssue(segment.slices);

          return issue ? (
            <span
              className={cn(lintSegmentVariants({ severity: issue.severity }))}
              data-lint-rule={issue.ruleId}
              data-lint-severity={issue.severity}
            >
              {children}
            </span>
          ) : (
            children
          );
        }}
      />
    </div>
  );
};

const LintingExample = () => {
  const editor = useSlateEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'This paragraph obviously has a spacing problem ,and the linter should report it.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Server diagnostics can arrive later without changing the Slate document.',
          },
        ],
      },
    ],
  });
  const [lintMode, setLintMode] = useState<LintMode>('off');
  const [sourceLabel, setSourceLabel] = useState('idle');

  const lintingSource = useSlateRangeDecorationSource<LintIssue>(editor, {
    deps: [lintMode],
    id: 'linting',
    dirtiness: ['text', 'external'],
    read: ({ snapshot }): readonly SlateRangeDecoration<LintIssue>[] =>
      lintMode === 'off'
        ? []
        : collectLintIssues(snapshot, {
            includeServerDiagnostics: lintMode === 'server',
          }),
  });

  return (
    <Slate decorationSources={[lintingSource]} editor={editor}>
      <LintingPanel
        lintMode={lintMode}
        setLintMode={setLintMode}
        setSourceLabel={setSourceLabel}
        sourceLabel={sourceLabel}
      />
    </Slate>
  );
};

export default LintingExample;
