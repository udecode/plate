# Test harvest

Mine a local `..` editor checkout (Lexical, ProseMirror, CodeMirror, Tiptap, Monaco, Quill, ProseKit, Meowdown, etc.) for portable behavior proof and route to raw Slate v2 (Plite) substrate or Plate packages/kits/examples/docs. Never clone the upstream framework.

- `--issues`: mine issue corpus for robustness pressure (all states default; cluster first, skip noise hard, extract portable invariants, map to Plite/Plate). `issue-harvester` owns row-by-row closure, autodiscovery, refresh, closed-issue provenance, and checkmarks.
- Source-first, exhaustive inventory, concrete skip reasons, evidence rows, complete passes, narrow claims. Edit Plite/Plate source/tests only with `--apply`; lane-plan mode writes only plan + evidence.
- Requests for "all Slate tests", "all Plate rows", "a lane plan", or "the execution plan" from an existing harvest use [Lane-plan mode](#lane-plan-mode).

## Incremental test sync (`--since <commit>`)

Updates an existing harvest over `<commit>..HEAD`: require complete prior `report.md`, `inventory.md`, `test-index.md` and `<commit>` ancestor of `HEAD` (else full harvest). Inspect changed tests, shared fixtures, helpers, harness config, and imported source (expand to dependent tests):

```bash
git -C <target> diff --name-status --find-renames <commit>..HEAD -- '*test*' '*spec*' '*/tests/*' '*/__tests__/*' '*/fixtures/*'
```

Reclassify changed/new tests, remove/redirect deleted/renamed rows, keep unaffected verified rows, rerun local coverage search for changed invariants, and rewrite `report.md`, `inventory.md`, `test-index.md` in place with `previous_source_commit`, `source_commit`, diff command, changed counts, and delta-complete vs full-fallback status. Advance `testHarvestCommit` only after artifacts and focused checks pass.

## Sources and license gate

Inspect local checkouts under `..` (clone missing `owner/repo` to `../repo-name`; never browse GitHub files), Plate tests/scripts/owners, `docs/research/sources/plate-notes/`, `issue-harvester`'s Closed-Issue PR/Test Provenance, and (for lane plans) Plan playbook. In `--issues`, `gitcrawl`/`gh` supplies metadata/comments as candidate/provenance input only; source, tests, license come from local checkout.

Classify license from local `LICENSE*`, `LICENCE*`, `COPYING*`, `NOTICE*`, `package.json`, `pnpm-workspace.yaml`, `package.yaml` before choosing output dir:

- `permissive` (MIT, BSD-2-Clause, BSD-3-Clause, Apache-2.0, ISC, CC0, equivalent; zero copyleft/commercial/source-available): `docs/editor-test-harvester/<repo>/` (`output_mode: durable`, `versioned_copy_policy: normal`).
- `behavior-only` (GPL, LGPL, AGPL, MPL, EPL, CDDL, proprietary, commercial, source-available, Business Source, Elastic, SSPL, mixed, unclear, missing; default on doubt): `.tmp/editor-test-harvester/<repo>/` (`output_mode: scratch`, `versioned_copy_policy: fresh-invariant-only`).
- `--issues`: durable `docs/editor-issue-harvester/<repo>/` in either mode (compact rows, URLs, classifications, portable invariants, coverage decisions, proof commands only); raw bodies/comments/JSON/cache in `.tmp/editor-issue-harvester/<repo>/raw/`.

Never paste upstream test code verbatim into versioned output; write fresh local proof citing source paths only. For `behavior-only`, `.tmp` allows source-adjacent notes, while versioned output forbids copying/translating upstream test code, fixtures, helpers, snapshots, expected-output blobs, expressive prose, or non-generic fixture shapes (`copy-now` = fresh local proof). Use one stable undated folder per repo (`<repo>` = lowercased basename; never dated harvest reports in `docs/plans/`); reruns rewrite in place and note new/removed rows.

## Categories, core rules, and readiness

Categories (1/file): `portable` (framework-agnostic editor behavior), `portable-mixed` (raw behavior wrapped in framework/product policy; split first), `plate-owned` (Plate feature/product behavior; see taxonomy), `skip` (non-portable internals/UI/tooling; concrete reason required, never "looks internal"), `harness` (reusable test technique, no product assertion), `product-shell` (app/demo outside substrate), `uncertain` (needs read; 0 at closure).

- Preserve invariants, not upstream API shape; strengthen/split existing tests over duplicating. Route runtime-boundary invariants to a small fake-runtime/contract helper driving both sides (promote only when shared).
- In `--issues`, skip framework/API/packaging/product/docs/release/support noise unless exposing a raw primitive gap. Never patch from title/body alone; closed issues are regression pressure, not closure claims.
- Status stays `pending` while passes/checkmarks remain. Call `done` only when all passes, readiness evidence, and full appendix complete (or verdict notes quick report), with 0 `uncertain` or unexamined `portable-mixed` files and an honest browser/IME/device boundary. Never estimate probabilities or award numeric scores.

| Readiness dimension | Required evidence |
| --- | --- |
| Inventory | Exact query; found = classified = resolved counts; every file in linked appendix. |
| Behavior extraction | Portable/mixed files read; runnable test names indexed with pointers; rejected rows explained. |
| Skip precision | Concrete skip reasons + read negative control per large skip family. |
| Owner coverage | Current Plite/Plate searches; exact coverage or named gap per actionable row. |
| Actionability | Target file, proof kind, focused command, or explicit defer owner/reason. |
| Provenance | Verified revision, linked issue evidence if relevant, license, output placement. |

## Pass schedule and discovery commands

Run 10 explicit passes logged in Pass-State Ledger (`Pass | Status (pending/in_progress/complete) | Evidence added | Report delta | Open issues | Next owner`):

1. **Intake:** target, license/output dirs, issue mode/states, surfaces/non-goals, `--apply`, browser/device availability.
2. **Inventory:** package manager/harnesses + full test list, split runnable vs support, initial categories:
   ```bash
   rg --files "$target" | rg '(^|/)(package.json|bun.lock|pnpm-lock.yaml|yarn.lock|vitest|jest|playwright|wdio|cypress)'
   rg --files "$target" | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'
   ```
3. **Issue inventory & clusters (`--issues`):** all-state inventory via `issue-harvester` archive (`gitcrawl` first; log fallback/state coverage/limit/freshness), raw cache in `.tmp`, cluster into portable robustness, `portable-mixed`, `plate-owned`, `skip`, `security-quarantine` (CVE/GHSA/exploit/sensitive-data; never in normal harvest).
4. **Test names:** `rg -n "(describe|it|test)\(" <files>` on runnable portable/mixed/uncertain files (index huge files first). Reopen runnable files with 0 extracted tests before closure (setup/TODO-only = `harness`; demo route != behavior row).
5. **Classification pressure:** challenge skips/product-shell with negative controls; build required DOM shape (e.g., nested contenteditable) before omitting browser-quirk rows (weak examples != omission evidence).
6. **Behavior extraction:** read portable/uncertain files + representative open/closed issues per kept cluster; extract behavior invariants (file, line, test name, tag, proof kind, browser/device needs, issue rationale).
7. **Coverage mapping:** search Plate by behavior keywords/adjacent concepts + packages/kits/docs/examples (never cite old plans).
8. **Action planning:** 1 action/row + owner, proof kind, command/defer: `covered` (proves invariant on runtime output; harness reshaping input/output/selection = `refactor-existing`), `refactor-existing`, `create-new` (target), `copy-now` (`--apply`; fresh proof for `behavior-only`), `defer`, `plate-owned`, `skip`.
9. **Ecosystem synthesis:** Plite steal/reject/diverge, Plate ownership, browser/runtime/testing strategy.
10. **Closure review:** readiness evidence, pass ledger, gaps/next owner, license placement.

## Lane-plan mode

`research harvest plan <lane> <report-or-repo-key>` or `research harvest <report-or-repo-key> --lane <lane>`:

| Lane | Aliases | Owner | Output |
| --- | --- | --- | --- |
| `slate-v2` | `slate`, `raw-slate` | Raw Plite substrate | `docs/plans/YYYY-MM-DD-slate-v2-<repo>-harvest-plan.md` |
| `plate` | `platejs`, `plate-owned` | Plate packages/kits/docs/examples/policy | `docs/plans/YYYY-MM-DD-plate-<repo>-harvest-plan.md` |

Infer unknown lane only if obvious from owner labels, else ask (never invent). Preserve license mode, split Plate/Plite rows, assign honest browser/clipboard/selection/mobile/IME proof routes. "All lane tests" = `covered`, `refactor-existing`, `create-new`, `fresh-invariant`, permissive `copy-now`, `defer`, unresolved.

1. Resolve report (explicit path -> `docs/editor-test-harvester/<repo>/report.md` -> `.tmp/editor-test-harvester/<repo>/report.md` -> harvest first); reuse/create `docs/plans/<date>-<slug>.md`.
2. Read harvest metadata, readiness, license/output mode, counts, matrix, skips, next slice, pass ledger; verify `inventory.md` & `test-index.md` exist or explain why not.
3. Account for every row: `in-lane`, `out-of-lane`, `split`, `duplicate`, `skip`, `unresolved`.
4. `slate-v2` owns raw substrate (selection DOM mapping, beforeinput/input, IME/composition, clipboard/paste, drag/drop, history, normalization, transforms, delete/backspace, fragment insertion, marks/inlines, voids, shadow DOM, browser engines, focus/blur, large-doc perf) and splits out `plate-owned` policy.
5. Check current owner coverage; apply Layer gates (`.agents/playbooks/references/architecture.md`: Plite for `slate-v2`; Plate for `plate`).
6. Write plan per `.agents/pstack/rules/pages.md`: full row accounting + in-lane matrix in Evidence, execution queue in Steps, execution handoff (plan path, lane, queue IDs, boundaries, focused commands, broad final gate, issue/claim sync rule, stop rule).
7. Mark `done` only once steps 1-6 are complete with 0 unresolved in-lane rows, per-row owner/action/target/proof/command-or-defer, fresh-invariant wording (`behavior-only`), and execution handoff; else `pending` + next pass. Planning-only stops; existing apply authority continues via lane owner.

## Portable test taxonomy

Tags: `ime-composition`, `beforeinput-input`, `composition-selection-repair`, `selection-dom-mapping`, `clipboard-paste`, `drag-drop`, `history-undo-redo`, `normalization-schema`, `delete-backspace`, `insert-fragment`, `marks-inline`, `void-atom`, `tables-grid`, `decorations-overlays`, `collaboration-remote`, `performance-large-doc`, `accessibility-keyboard`, `serialization-parsing`, `browser-engine`, `mobile-device`, `focus-blur`, `shadow-dom`, `pagination-layout`, `structured-blocks`, `markdown-richtext-roundtrip`.

- **Portable:** IME across marks/decorations/voids/undo; selection around ZWS/voids/inlines/tables; browser selection (Firefox multi-range); native paste/drag/drop/beforeinput/compositionend ordering; undo granularity; mixed-boundary fragment insertion; collab position mapping; layout/pagination editor semantics.
- **DOM selection ranking:** ProseMirror `view/test/webtest-selection.ts` primary (import/export, coordinates, fallback); Lexical shapes browser regressions/skip discipline; Tiptap focus tests = focus-timing pressure only (never justify command API).
- **Skip:** React/Vue/Svelte internals, node-class/plugin-object mechanics, command registry wiring, harness self-tests, demo chrome/UX/style snapshots, non-reducible `behavior-only` rows.
- **Plate-owned:** link/autolink grammar; list/checklist indentation/metadata/exit/ARIA; Markdown/MDX UX/serializer policy; mention/hashtag/keyword/emoji/date-time/equation/media plugins; React plugin hosts/menus/typeahead/toolbar/examples; NodeView/MarkView/PluginView authoring; Tiptap-style extension/command/schema ergonomics.

## Output shape and verification

Write `<report_dir>/report.md`, `inventory.md` (link large appendix, never omit), `test-index.md`. `--issues` writes `issues.md`, `clusters.md`, `matrix.md` in `docs/editor-issue-harvester/<repo>/` + raw cache in `.tmp/editor-issue-harvester/<repo>/raw/issues.json` and `issue-bodies/*.json`. With `--apply`, edit tests only after matrix exists, in verifiable slices; comments explain protected behavior, never upstream history.

`report.md` keys/sections: `status` (`pending|first-pass done|done`), `readiness` (`open|complete`), `license_mode` (`permissive|behavior-only`), `license_evidence`, `output_mode` (`durable|scratch`), `versioned_copy_policy` (`normal|fresh-invariant-only`); `## Inventory` (`target`, `test files found`, `portable`, `portable-mixed`, `plate-owned`, `skipped`, `harness/product/uncertain`), `## License Gate` (`Field | Value`), `## Readiness Evidence` (`Dimension | Status | Evidence or gap`), `## Pass-State Ledger` (`Pass | Status | Evidence added | Report delta | Open issues | Next owner`), `## Matrix` (`Source ref | Test ref | Tag | Behavior invariant | Proof kind | Owner coverage | Action`), `## Skips` (`Source | Reason`), `## Next Slice`, `## Full Inventory Appendix` (`Source | Runnable | Category | Reason | Test-name extraction`).

```bash
report_dir="docs/editor-test-harvester/<repo>" # .tmp/... for behavior-only
rg --files <target> | rg '<test inventory pattern>' | wc -l
rg -n "License Gate|Readiness Evidence|Pass-State Ledger|Matrix|Skips|Next Slice|Full Inventory Appendix" "$report_dir/report.md"
test -f "$report_dir/inventory.md" && test -f "$report_dir/test-index.md"
issue_dir="docs/editor-issue-harvester/<repo>"
test -f "$issue_dir/issues.md" && test -f "$issue_dir/clusters.md" && test -f "$issue_dir/matrix.md" && test -d ".tmp/editor-issue-harvester/<repo>/raw"
rg -n "Issue State Coverage|Cluster Matrix|Slate/Plate Coverage|Next Slice" "$issue_dir/issues.md" "$issue_dir/clusters.md" "$issue_dir/matrix.md"
rg -n "state: all|open \\+ closed|closed" "$issue_dir/issues.md" "$issue_dir/clusters.md"
! rg -n "bodyMarkdown|bodyText|comments\\s*:" "$issue_dir" 2>/dev/null
test ! -f "docs/editor-test-harvester/<repo>/inventory.md" && test ! -f "docs/editor-test-harvester/<repo>/test-index.md"
rg -n "copied from|verbatim|fixture copied|ported from" docs packages apps content benchmarks tooling 2>/dev/null || true
```
