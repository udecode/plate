import { cva } from 'class-variance-authority';
import {
  type Ancestor,
  type EditorSnapshot,
  NodeApi,
  type Path,
  type Range,
} from 'plitejs';
import {
  Editable,
  Plite,
  type PliteDecoration,
  type PliteDecorationSource,
  useEditorContext,
  useEditorState,
  useEditor,
} from 'plitejs/react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';

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

type LintIssueMatch = {
  issue: LintIssue;
  key: string;
  range: Range;
};

const NO_LINT_ISSUES: readonly LintIssueMatch[] = [];

const lintSegmentVariants = cva('plite-linting-segment', {
  variants: {
    severity: {
      error: 'plite-linting-segment-error',
      info: 'plite-linting-segment-info',
      warning: 'plite-linting-segment-warning',
    },
  },
});

const keyFor = (ruleId: string, range: Range) =>
  `${ruleId}:${range.anchor.path.join('.')}:${range.anchor.offset}`;

const createIssue = (
  range: Range,
  issue: Omit<LintIssue, 'id'>
): LintIssueMatch => {
  const id = keyFor(issue.ruleId, range);

  return {
    issue: {
      ...issue,
      id,
    },
    key: id,
    range,
  };
};

const collectLintIssues = (
  children: EditorSnapshot['children'],
  {
    includeServerDiagnostics = false,
  }: {
    includeServerDiagnostics?: boolean;
  } = {}
): LintIssueMatch[] => {
  const root = { children } as Ancestor;
  const issues: LintIssueMatch[] = [];

  for (const [node, path] of NodeApi.nodes(root)) {
    if (NodeApi.isText(node)) {
      issues.push(
        ...collectTextLintIssues(node.text, path, includeServerDiagnostics)
      );
    }
  }

  return issues;
};

const formatIssues = (issues: readonly LintIssueMatch[]) =>
  issues.length === 0
    ? 'none'
    : issues
        .map((match) => `${match.issue.ruleId}:${match.issue.severity}`)
        .join('|');

const toLintDecoration = (match: LintIssueMatch): PliteDecoration => ({
  attributes: {
    className: lintSegmentVariants({ severity: match.issue.severity }),
    'data-lint-rule': match.issue.ruleId,
    'data-lint-severity': match.issue.severity,
  },
  key: match.key,
  range: match.range,
});

function collectTextLintIssues(
  text: string,
  path: Path,
  includeServerDiagnostics: boolean
) {
  const issues: LintIssueMatch[] = [];
  const addMatches = (pattern: RegExp, issue: Omit<LintIssue, 'id'>) => {
    for (const match of text.matchAll(pattern)) {
      const start = match.index;

      if (start === undefined) continue;

      issues.push(
        createIssue(
          {
            anchor: { offset: start, path },
            focus: { offset: start + match[0].length, path },
          },
          issue
        )
      );
    }
  };

  addMatches(/\b(obviously|clearly|evidently|simply)\b/gi, {
    message: 'Avoid filler words in product copy.',
    ruleId: 'style-filler-word',
    severity: 'warning',
  });
  addMatches(/ , ?/g, {
    fixText: ', ',
    message: 'Remove the space before commas.',
    ruleId: 'comma-spacing',
    severity: 'error',
  });

  if (includeServerDiagnostics) {
    addMatches(/server diagnostics/gi, {
      message: 'Server rule prefers "remote lint results" here.',
      ruleId: 'server-terminology',
      severity: 'info',
    });
  }

  return issues;
}

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
  const editor = useEditorContext();
  const diagnostics = useEditorState((state) =>
    lintMode === 'off'
      ? NO_LINT_ISSUES
      : collectLintIssues(state.value().children, {
          includeServerDiagnostics: lintMode === 'server',
        })
  );

  const collectFromEditor = (mode: LintMode) =>
    mode === 'off'
      ? NO_LINT_ISSUES
      : collectLintIssues(editor.read.value().children, {
          includeServerDiagnostics: mode === 'server',
        });

  const runLocalLint = () => {
    setLintMode('local');
    setSourceLabel('local');
  };

  const applyFirstFix = () => {
    const mode = lintMode === 'off' ? 'local' : lintMode;
    const fix = collectFromEditor(mode).find(
      (diagnostic) => diagnostic.issue.fixText
    );

    const fixText = fix?.issue.fixText;

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
    <div className="plite-linting-panel">
      <Instruction>
        This linter keeps findings outside the Plite document.{' '}
        <code>decorations</code> maps lint findings to range attributes and
        refreshes on text edits or external source changes.
      </Instruction>
      <div className="plite-linting-controls">
        <Button onClick={runLocalLint} type="button" variant="outline">
          Run linter
        </Button>
        <Button
          disabled={!diagnostics.some((diagnostic) => diagnostic.issue.fixText)}
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
      <div className="plite-linting-status">
        <span className="plite-linting-code" id="linting-source">
          source:{sourceLabel}
        </span>
        <span className="plite-linting-code" id="linting-count">
          issues:{diagnostics.length}
        </span>
        <span className="plite-linting-code" id="linting-snapshot">
          {formatIssues(diagnostics)}
        </span>
      </div>
      <ul className="plite-linting-issue-list" id="linting-issues">
        {diagnostics.map((diagnostic) => (
          <li
            className="plite-linting-issue"
            data-lint-issue={diagnostic.issue.id}
            key={diagnostic.issue.id}
          >
            <strong>{diagnostic.issue.severity}</strong>:{' '}
            {diagnostic.issue.message}
          </li>
        ))}
      </ul>
      <Editable className="plite-linting-editor" id="linting" />
    </div>
  );
};

const LintingExample = () => {
  const editor = useEditor({
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
            text: 'Server diagnostics can arrive later without changing the Plite document.',
          },
        ],
      },
    ],
  });
  const [lintMode, setLintMode] = useState<LintMode>('off');
  const [sourceLabel, setSourceLabel] = useState('idle');

  const lintingSource = useMemo<PliteDecorationSource<typeof editor>>(
    () => ({
      id: 'linting',
      read: ({ entry: [node, path] }) =>
        lintMode === 'off' || !NodeApi.isText(node)
          ? []
          : collectTextLintIssues(node.text, path, lintMode === 'server').map(
              toLintDecoration
            ),
    }),
    [lintMode]
  );

  return (
    <Plite decorations={[lintingSource]} editor={editor}>
      <LintingPanel
        lintMode={lintMode}
        setLintMode={setLintMode}
        setSourceLabel={setSourceLabel}
        sourceLabel={sourceLabel}
      />
    </Plite>
  );
};

export default LintingExample;
