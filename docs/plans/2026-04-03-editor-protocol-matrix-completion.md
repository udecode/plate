# Editor Protocol Matrix Completion

## Goal

Push `docs/editor-behavior/editor-protocol-matrix.md` from broad family coverage
to near-exhaustive markdown/Typora protocol coverage for the still-missing rows:

- paragraph expanded-selection variants
- heading selection variants
- deeper blockquote variants
- fuller code-block variants
- more table anchor/focus and boundary escalation rows
- mention/date movement variants
- TOC non-delete keyboard behavior
- columns per-key behavior
- explicit evidence mapping for every remaining `seeded` or `partial` row in the
  in-scope markdown/Typora lane

## Constraints

- keep `markdown-editing-spec.md` readable; do not dump exhaustive rows there
- keep `markdown-parity-matrix.md` as the release gate, not the protocol doc
- follow `docs/editor-behavior/markdown-standards.md` authority order
- treat `toggle`, `comment`, `suggestion`, `discussion`, and `yjs` as deferred

## Findings

- `docs/solutions/patterns/critical-patterns.md` does not exist here, so the
  learnings pass has to rely on targeted solution docs instead of that global
  file.
- Existing solution docs already lock two key laws we must not contradict:
  - markdown containers lift one level at a time
  - table selection must own keydown before native selection flashes
- The current protocol matrix already covers a lot of family breadth, but too
  many rows still stop at `seeded` or `partial`.
- The missing work is mostly row expansion plus evidence mapping, not new code.

## Phases

1. gather missing scenario families and supporting tests
2. expand the protocol matrix with the requested rows
3. map every touched row to current evidence or mark the true gap
4. sync spec/readme only if the doc split drifted
5. verify docs formatting and report the honest remaining gap

## Progress

- 2026-04-03: started learnings pass and current-doc audit
- 2026-04-03: expanded `editor-protocol-matrix.md` for paragraph selections,
  heading selections, deeper blockquote and code-block rows, table boundary and
  anchor/focus cases, mention/date movement, TOC non-delete keys, and column
  per-key behavior
- 2026-04-03: tightened row-level evidence so touched `specified` and `partial`
  rows point at real tests or explicit missing targeted regressions
- 2026-04-03: updated `README.md` so the protocol file is described as the
  row-level matrix instead of just a backlog
- 2026-04-03: `pnpm lint:fix` passed after the doc expansion
- 2026-04-03: added real tests for markdown-native paragraph, heading,
  blockquote, list, code-block, and table protocol rows that were still only
  partial or specified
- 2026-04-03: fixed real behavior gaps for same-block heading selection `↵`,
  table second `selectAll`, first-line code-block `⌫`, empty inner code-line
  `⌫`, and multiblock quoted `⇤`
- 2026-04-03: closed the remaining block-editor-native protocol rows for
  mention, date, TOC, and columns with targeted tests; mention arrow movement
  now treats mentions as atomic steps
- 2026-04-03: expanded the protocol matrix to cover task-list, strikethrough,
  and math rows instead of leaving tables as the only markdown-extension
  protocol family
- 2026-04-03: closed the remaining styling/layout protocol rows by locking
  `textIndent` and broader indent ownership with direct tests
- 2026-04-03: external standards pass confirmed the current UX north stars and
  added one missing authority: GitHub for GFM-only constructs; math authority
  is now stated as LaTeX / KaTeX-style conventions instead of hiding behind
  implementation-library names
- 2026-04-03: reopened `autolink literal` and `footnote` as the remaining
  explicit blockers to a literal "100% CommonMark + GFM extensions" claim
- 2026-04-03: closed `autolink literal` with package-surface coverage and fixed
  markdown serialization to emit bare URL markdown instead of degrading to
  bracket-link form
- 2026-04-03: upgraded footnote fallback from silent data loss to explicit
  plain-text preservation of references and definitions, then locked that
  fallback in package and app tests
- 2026-04-03: adversarial external rescan did not surface a stronger generic
  WYSIWYG authority than Typora / Google Docs / Notion / Milkdown, but it did
  confirm GitHub should stay explicit for GFM-only constructs and pushed table
  structure ops into the protocol matrix
- 2026-04-03: created an explicit deferred integration red suite under
  `apps/www/src/__tests__/package-integration/__deferred__/` for the remaining
  interaction classes outside the current content-editing claim:
  clipboard, IME/composition, mouse drag/selection, and platform shortcuts
