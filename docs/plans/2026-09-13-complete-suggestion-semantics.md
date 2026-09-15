# Complete suggestion semantics

Status: Complete

## Outcome

Make native authored changes reviewable through real editor commands without
restoring a second Suggestion mutation engine. Keep discovery complete for large
documents, derive semantic detail only for an opened change, surface review
failures, and prove the paragraph-boundary and valued-mark lifecycles that the
Google Docs audit identified as the first release boundary.

## Authority and constraints

The user authorized full local implementation on 2026-09-13 and allowed an
architecture pivot if the result is not good enough. Product source, focused
tests, docs, and required generated registry output are in scope. No commit,
push, PR, release, or branch change was requested. Current branch: `next`.

Retain one mutation, identity, persistence, and decision owner in Plite. Plate
owns wording, markers, navigation, and application policy. Do not restore leaf
metadata or a parallel Suggestion state engine. Semantic reads must remain
demand-driven and must not make 10,000-change loading proportional to the cost
of rendering 10,000 review cards. The earlier performance instruction stops a
performance optimization line after three trials without a positive result.

## Acceptance

- [x] A singular native authored-change read exposes immutable semantic facts
      for inserted/removed/moved content, exact property before/after values, text
      boundaries, and root structure. Paged list reads remain compact.
- [x] The Plate review surface discovers pending and conflicted changes for the
      mounted block without the fixed first-200 feed or eager document-wide detail
      materialization.
- [x] Review cards describe paragraph boundaries, content, and property values,
      and visibly report blocked, stale, invalid, unavailable, and conflicted
      outcomes.
- [x] Real command-level contracts cover Enter split, Backspace merge, and a
      non-boolean mark value through accept/reject, follow-up typing, undo, and
      persistence where those boundaries materially differ.
- [x] Browser proof covers the reported caret, Enter, Backspace, first-paint,
      decision, follow-up typing, and reload behavior with strict runtime errors.
- [x] The existing 10,000-change benchmark comparator shows that compact list
      loading remains bounded and lazy semantic detail does not regress the
      complete operation.
- [x] Public exports, Plate facade inference, source checks, registry output,
      and affected docs are reconciled and verified.

## Design decision

Keep `read.authored.change()` and `read.authored.changes()` as compact summary
queries. Add one lazy `read.authored.details(id)` read instead of adding another
review store or framework. It returns the summary, semantic parts, and native
review provenance from one captured snapshot, avoiding a race between separate
reads. The facts are derived from the native retained operation graph and
current view projection, cached by authored state/projection identity, and
never added to every page item.

Delete the global React hook that treats the first page as the complete review
feed. Each mounted block queries the native spatial index with `changesAt`; the
discussion controller stores only compact memberships and reads full detail
when a card is shown. A separate all-changes UI, if added later, must virtualize
cursor pages and restart from a new snapshot when the cursor becomes stale.

## Proof

Baseline on 2026-09-13: the five existing Chromium suggestion tests pass in
9.7 seconds. They establish the repaired immediate behaviors but do not cover
review, history, persistence, or follow-up typing after structural commands.

Final command and API proof:

- 353 authored and Plate facade tests pass across 19 files, including real Enter
  split, Backspace merge, valued-mark, retention, decision undo, and Yjs
  contracts.
- 25 decoration-manager contracts pass, including the synchronous native-input
  refresh regression. The authored and React source partitions, Plite package
  build, and complete Plite test typecheck pass.
- 14 discussion and suggestion component tests pass. The focused Plate plugin
  identity and DnD suites pass, including the configured intermediate-ancestor
  regression.
- Five Chromium journeys pass in 8.4 seconds: original playground content,
  exact first-frame suggestion offsets, rapid caret navigation plus typing,
  accepted Enter split plus typing, and rejected Backspace merge plus typing.

The final three 10,000-change source runs completed in 2579.542, 2319.267, and
2356.809 ms (2356.809 ms median). Median compact query time was 19.378 ms, lazy
detail 1.784 ms, cached detail 0.040 ms, cold block-local discovery 698.945 ms,
cached block-local discovery 0.095 ms, the first continued edit 34.855 ms, and
post-edit block-local discovery 0.519 ms. This is about 94.9% faster than the
46.410-second original baseline and about 67.8% faster than the earlier
7.311-second checkpoint. The raw ProseMirror microbenchmarks remain materially
faster, but they do not perform the retained causal history, projections,
persistence, and review decisions measured here.

`pnpm brl`, `pnpm --filter www build:registry`,
`pnpm --filter www build:source`, focused formatting, and `git diff --check`
pass. The repo-wide docs check remains blocked before reaching the affected MDX
by the concurrent public-plugin API-reference migration: `definePluginPoint`
is neither included nor excluded exactly once. Focused lint likewise reports
the existing entrypoint-boundary debt in authored/React internals and the
concurrent Plate-to-Plite internal plugin import; no formatting findings remain.

## Remaining audit boundary

The omission challenge covers all 48 Google Docs request union members and all
32 earlier native contracts through 44 selected families (37 Google-facing and
7 Plate/Plite lifecycle families). That crosswalk proves the audit denominator,
not complete Google Docs parity. This iteration closes the first release
boundary: paragraphs, valued marks, review discovery and diagnostics, realtime
decorations, caret behavior, persistence, and scale. Lists, tables, complex
structural conversions, second-author concurrency, offline behavior, real IME,
mobile, and assistive-technology journeys remain audited backlog and require
their own product and browser proof before a full-parity claim is honest.
