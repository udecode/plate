---
title: Non React Testing Review Must Regenerate The Scoped Test File List Before Coverage
type: workflow-issue
date: 2026-03-25
status: solved
---

# Non React Testing Review Must Regenerate The Scoped Test File List Before Coverage

## Problem

A scoped non-React coverage review reused `.claude/tmp/non_react_test_files.txt` from an older pass. New non-React specs were missing from the list, so the audit falsely treated some runtime files as uncovered or under-covered.

## Signal

- files with fresh adjacent specs still showed impossible coverage gaps
- the scoped file count lagged behind the actual repo test count
- package ranking drifted toward already-tested files

## Fix

Regenerate the scoped test file list before running non-React coverage. Do not trust an old tmp file just because it exists.

Example:

```bash
python3 - <<'PY'
from pathlib import Path
root = Path('/Users/zbeyens/git/plate')
out = root / '.claude/tmp/non_react_test_files.txt'
paths = []
for base in [root / 'packages', root / 'apps']:
    for path in sorted(base.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(root).as_posix()
        if '/react/' in rel:
            continue
        if '.spec.' not in path.name and '.slow.' not in path.name:
            continue
        if path.suffix not in {'.ts', '.tsx', '.js', '.jsx'}:
            continue
        paths.append(rel)
out.write_text('\n'.join(paths) + ('\n' if paths else ''))
PY
```

Then run scoped coverage from that regenerated list.

## Rule

If a testing-review pass depends on a scoped tmp file, refresh the file from current repo state first. Otherwise the audit is lying before it even starts.
