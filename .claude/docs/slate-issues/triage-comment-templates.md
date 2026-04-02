---
date: 2026-04-02
topic: slate-v2-triage-comment-templates
pilot: false
pilot_scope: 682 open issues
repo: ianstormtaylor/slate
---

# Slate v2 Triage Comment Templates

## Purpose

These are the Batch A comment shapes used by [.claude/scripts/slate-batch-a-triage.py](/Users/zbeyens/git/plate-2/.claude/scripts/slate-batch-a-triage.py).

The script adds per-issue rationale.

The template stays simple on purpose. Closing comments should be clear, not theatrical.

Batch A has already been executed, so this file now serves as the historical template reference for that run and as a starting point for future triage batches.

## Invalid Template

```md
Closing this because it does not look like a current Slate bug.

{issue-specific rationale}

If there is a minimal repro showing current Slate behavior is at fault, a narrower follow-up can be opened.
```

## Duplicate Template

```md
Closing in favor of {target}.

{issue-specific rationale}

Keeping discussion in one canonical thread is cleaner.
```

## Execution Notes

- script defaults to dry-run
- `--execute` is required for real GitHub writes
- invalid issues close with `gh issue close --reason not planned`
- duplicate closures close without forcing a GitHub close reason
- Batch A itself should not be rerun without refreshing live GitHub issue state first
