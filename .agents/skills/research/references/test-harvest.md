# Test harvest

Mine another editor repository for tests worth harvesting: Lexical, ProseMirror, CodeMirror, Tiptap, Monaco, Quill, ProseKit, Meowdown, or any local clone under `..`. The job is not to clone their framework. It is to extract portable editor behavior proof and route it to the right owner: raw Slate v2 (Plite) substrate, or Plate packages, kits, examples and docs.

- With `--issues`, mine the editor's issue corpus for robustness pressure, not to mirror its backlog: all states by default, cluster first, skip unrelated issues hard, extract portable invariants, then map them to Plite/Plate coverage. `issue-harvester` owns the exhaustive issue-by-issue closure that follows: ledger autodiscovery, refresh, closed-issue provenance, unchecked rows and coverage checkmarks.

Work source-first with an exhaustive inventory, explicit skip reasons, evidence rows, complete passes and narrow claims: exact thread, exact behavior, no speculative closure claim, no broad claim without current source proof. Implement only when asked (`--apply`).

## Incremental test sync

`--since <commit>` updates an existing harvest from the exact range `<commit>..HEAD`.

1. Require a complete prior report, inventory and test index; otherwise run the full inventory.
2. Require `<commit>` to be an ancestor of `HEAD`; rewritten or unrelated history needs a full harvest.
3. Inspect added, modified, renamed and deleted test files:

   ```bash
   git -C <target> diff --name-status --find-renames <commit>..HEAD -- \
     '*test*' '*spec*' '*/tests/*' '*/__tests__/*' '*/fixtures/*'
   ```

4. Also inspect changed shared fixtures, helpers, harness configuration and source imported by changed tests, expanding to dependent test files when a helper or fixture changed.
5. Reclassify every changed or new test, remove or redirect deleted and renamed rows, and keep unaffected rows from the verified baseline.
6. Rerun the local coverage search for every changed portable invariant; a source diff narrows candidates but does not prove coverage stayed equivalent.
7. Rewrite the stable report, inventory and test index in place, recording `previous_source_commit`, `source_commit`, the diff command, changed counts, and whether the run was delta-complete or fell back to full.

The caller advances `testHarvestCommit` only after the updated artifacts and focused verification pass; an interrupted delta keeps the prior cursor.

A request to process an existing harvest into "all Slate tests", "all Plate rows", "a lane plan" or "the execution plan" switches to [lane-plan mode](#lane-plan-mode) in this skill.

## Sources

1. The target's license evidence: `LICENSE`, `LICENCE`, `COPYING`, `NOTICE`, package or workspace metadata.
2. The target repo as a local checkout such as `../lexical`. Never browse GitHub files; clone a missing `owner/repo` to `../repo-name`.
3. The Plate repo's current test files and package scripts.
4. Plate package, docs and example owners when the behavior is a plugin, kit, UI, React integration or product policy.
5. `docs/research/sources/plate-notes/` for prior browser, IME, selection and mobile proof lessons.
6. `issue-harvester`'s Closed-Issue PR/Test Provenance for issue and PR provenance when a test exists because of a known upstream bug.
7. For lane-plan mode, the Plan playbook, with the Plite layer for `slate-v2` and the Plate layer for `plate`.

In issue mode, GitHub issue data is candidate and provenance input, not implementation source. Use `gitcrawl` or `gh` for issue metadata and comments, and the local checkout for source, tests and license evidence.

## License gate and output mode

Classify the license from local files before choosing any output directory:

- `permissive`: MIT, BSD-2-Clause, BSD-3-Clause, Apache-2.0, ISC, CC0 or clearly equivalent. Harvest artifacts go to `docs/editor-test-harvester/<repo>/`.
- `behavior-only`: GPL, LGPL, AGPL, MPL, EPL, CDDL, proprietary, commercial, source-available, mixed or unclear licensing, or missing evidence. Harvest artifacts, including `inventory.md` and `test-index.md`, go to the unversioned `.tmp/editor-test-harvester/<repo>/`. When in doubt, use this mode.
- `--issues`: the durable issue workspace is `docs/editor-issue-harvester/<repo>/` in either mode and holds only compact rows, URLs, classifications, portable invariants, coverage decisions and proof commands. Raw bodies, comments, hydrated JSON and cache stay in `.tmp/editor-issue-harvester/<repo>/raw/`.

Whatever the license mode, never paste upstream test code verbatim into versioned output; write the strongest fresh local proof of the invariant, citing source paths only. `behavior-only` does not block learning; it blocks copying into versioned output. Inside `.tmp`, source-adjacent notes and provenance are allowed. In anything versioned (Plate, Plite, docs, examples, commits, PRs), never copy or line-by-line translate upstream test code, fixtures, helpers, snapshots, expected-output blobs or expressive prose, and never preserve upstream fixture shape unless it is a generic factual editor state. Extract the invariant and write a fresh local proof with local fixtures, names, helpers and assertions, citing only source paths, minimal line references and short paraphrased labels. For these sources, `copy-now` means "write a fresh local proof from the invariant". Study the wound; don't transplant the skin.

## Core rules

- Build the complete target test-file inventory before reading favorite files. Every file ends in exactly one category: `portable`, `portable-mixed`, `plate-owned`, `skip`, `harness`, `product-shell` or `uncertain`. Every skip gets a concrete reason; "looks internal" is too vague.
- Keep one stable folder per repo; never date report file names or create dated harvest reports under `docs/plans/`. Reruns are idempotent: read the existing folder, rerun the inventory, update the same files and record new and removed source rows.
- Preserve the behavior invariant, not the upstream API shape. Strengthen or split a related existing test instead of duplicating it.
- A portable invariant that is really a runtime-boundary problem goes to a small fake-runtime or contract-test helper that drives both sides; promote the helper only when several rows share the boundary.
- Use `plate-owned` for behavior that fits Plate rather than raw Plite: link and autolink grammar, list and checklist policy, Markdown transformer UX, mention, hashtag, emoji and date-time plugins, media and product decorators, toolbar and menu state, React plugin hosts, NodeView- and PluginView-style authoring, and rich product examples. Raw Plite owns editor primitives; Plate owns opinionated features and product behavior.
- Edit Plite or Plate source and tests only with `--apply`. Lane-plan mode writes only the plan and its evidence.
- In issue mode, cluster by portable behavior before reading issues one by one, and skip Lexical or editor-specific API, node-class lifecycle, command registry, packaging, product UX, docs, release, support and framework-only issues unless they expose a raw primitive gap. Never patch from an issue title or body alone. Closed issues are often the best regression stories; they are pressure, not closure claims.
- Status is `pending` while passes or per-issue checkmarks remain. A single-pass matrix is a first-pass harvest; call a harvest comprehensive or `done` only when the pass schedule is complete, the readiness evidence is complete and the report has its full inventory appendix, or when the user asked for a quick report and the verdict says so.

## Readiness evidence

A harvest is `done` only when each dimension has concrete evidence; never estimate a probability or award a score.

| Dimension | Required evidence |
| --- | --- |
| Inventory | Exact query; found, classified and unresolved counts equal; every file in the linked appendix. |
| Behavior extraction | Portable and mixed files read; runnable test names indexed with source pointers; rejected rows explained. |
| Skip precision | Concrete skip reasons and a read negative control from each large skip family. |
| Owner coverage | Current Plite/Plate searches; exact coverage or a named gap for every actionable row. |
| Actionability | Target file, proof kind and focused command, or an explicit defer owner and reason. |
| Provenance | Verified source revision, exact linked issue evidence when relevant, license and output placement. |

Completion also requires no `uncertain` files, no unexamined `portable-mixed` files, a complete pass ledger and an honest browser, IME and device proof boundary. Issue mode records state coverage, inventory counts, classification, read representatives and the coverage matrix. A partial harvest names its missing rows and next owner.

## Pass schedule

Run harvests as passes, not one giant skim; the [discovery workflow](#discovery-workflow) holds each pass's commands.

1. **Intake:** target path, license mode, issue-mode decision and states, report directory, surfaces and non-goals, report-only or apply, browser and device availability.
2. **Inventory:** package manager and harnesses, the full test inventory, runnable tests split from support files, every row in the appendix with an initial category.
3. **Issue inventory and clusters** (`--issues`): all-state discovery into `issues.md`, raw cache in `.tmp`, clusters before deep reads.
4. **Test names:** `describe`, `it` and `test` names for every runnable portable, mixed and uncertain file; index huge files first, then read targeted ranges.
5. **Classification pressure:** challenge skips and product-shell routing with negative controls. Before classifying a browser-quirk row as omitted, build the DOM shape it depends on, such as a real nested contenteditable, and run the row there; a current example set too weak to expose the shape is not evidence for omission.
6. **Behavior extraction:** invariants with source file, line, test name, tag, proof kind, browser or device needs and issue rationale.
7. **Coverage mapping:** search the Plate repo by behavior words and adjacent concepts, and Plate packages, docs, examples and kits for product behavior; never cite old plans as coverage.
8. **Action planning:** one action per row, with target owner, proof kind and command or backlog owner.
9. **Ecosystem synthesis:** what Plite should steal, reject or diverge from, what Plate should own, and the browser, runtime and testing strategy.
10. **Closure review:** readiness evidence, pass ledger, open gaps and next owner, license placement.

Pass-state ledger rows record the pass, its status (`pending`, `in_progress` or `complete`), evidence added, report delta, open issues and next owner.

## Lane-plan mode

Process one owner lane of a completed or near-complete harvest into an execution-grade plan:

```text
research harvest plan slate-v2 tiptap
research harvest plan slate-v2 .tmp/editor-test-harvester/name/report.md
research harvest docs/editor-test-harvester/tiptap/report.md --lane slate-v2
```

| Lane | Aliases | Owner | Output |
| --- | --- | --- | --- |
| `slate-v2` | `slate`, `raw-slate` | Raw Plite substrate in the Plate repo | `docs/plans/YYYY-MM-DD-slate-v2-<repo>-harvest-plan.md` |
| `plate` | `platejs`, `plate-owned` | Plate packages, kits, docs, examples and product behavior | `docs/plans/YYYY-MM-DD-plate-<repo>-harvest-plan.md` |

Infer an unknown lane only when the harvest's owner labels make it obvious; otherwise ask. Never invent a lane. Lane plans preserve the harvest's license mode, never count Plate rows as Plite tests or the reverse without a split, and give browser, clipboard, selection, mobile and IME rows honest proof routes. "All lane tests" means every harvest row that belongs to the lane: `covered`, `refactor-existing`, `create-new`, `fresh-invariant`, permissive `copy-now`, `defer` and unresolved candidates.

1. Resolve the arguments: `plan <lane> <report-or-repo-key>` or `<report-or-repo-key> --lane <lane>`.
2. Resolve the report: an explicit path, else `docs/editor-test-harvester/<repo>/report.md`, else `.tmp/editor-test-harvester/<repo>/report.md`, else run or request harvest mode.
3. Reuse the file plan, or start one at `docs/plans/<date>-<slug>.md` for a standalone harvest.
4. Read the harvest metadata: status, readiness, license and output mode, inventory counts, matrix rows, skips, next slice and pass ledger. Validate that the inventory and test index exist, or record why not.
5. Account for every harvest row as `in-lane`, `out-of-lane`, `split`, `duplicate`, `skip` or `unresolved`.
6. For `slate-v2`, include raw substrate (selection DOM mapping, beforeinput and input, IME and composition, clipboard, paste, drag and drop, history, normalization, transforms, delete and backspace, fragment insertion, marks and inlines, void primitives, shadow DOM, browser engines, focus and blur, large-document performance) and split out product policy (links, lists, Markdown UX, mention-style plugins, media decorators, toolbar, menu and dialog state, React plugin hosts, NodeView- and PluginView-style authoring).
7. Search current owner coverage before claiming covered or missing: the Plate repo by behavior words for `slate-v2`; packages, kits, docs, examples and behavior-law docs for `plate`.
8. Apply the Layer gates in `.agents/playbooks/references/architecture.md` for the lane's layer: Plite for `slate-v2`, Plate for `plate`.
9. Write the lane plan in the plan-page shape, with the full harvest row accounting and the in-lane candidate matrix in its Evidence and the execution queue as its Steps. Its execution handoff names the plan path, lane, execution queue IDs, implementation boundaries, focused commands, broad final gate, issue and claim sync rule and stop rule.
10. Below threshold, keep `pending` and name the next pass. The lane plan is `done` only when the harvest report path and license mode are recorded, inventory and test-index status are recorded with reasons for missing files, every harvest row is accounted for, no unresolved in-lane row remains, every in-lane row has owner coverage, action, target location, proof kind and a verification command or explicit defer reason, downstream lane gates are recorded, behavior-only rows use fresh invariant wording only, and the execution handoff is present. When the gates pass, mark the result `done` and hand off: a planning-only request stops there; existing apply authority continues through the lane owner.

## Discovery workflow

1. Resolve the target repo: inspect the local checkout at `..`, or clone a missing `owner/repo` to `../repo-name`, as `AGENTS.md`'s Packages section says.
2. Classify the license mode before creating artifacts:

   ```bash
   target="../lexical"

   license_files=()
   while IFS= read -r license_file; do
     license_files+=("$license_file")
   done < <(
     {
       find "$target" -maxdepth 2 -type f \
         \( -iname 'LICENSE*' -o -iname 'LICENCE*' -o -iname 'COPYING*' -o -iname 'NOTICE*' \)
       find "$target" -maxdepth 3 -type f \
         \( -name 'package.json' -o -name 'pnpm-workspace.yaml' -o -name 'package.yaml' \)
     } | sort -u
   )

   mkdir -p .tmp/editor-test-harvest-license
   printf '%s\n' "${license_files[@]}" > .tmp/editor-test-harvest-license/files.txt

   if [ "${#license_files[@]}" -gt 0 ] && \
      rg -i 'MIT License|Apache License|BSD 2-Clause|BSD 3-Clause|ISC License|CC0|SPDX-License-Identifier:\s*(MIT|Apache-2.0|BSD-2-Clause|BSD-3-Clause|ISC|CC0-1.0)|"license"\s*:\s*"(MIT|Apache-2.0|BSD-2-Clause|BSD-3-Clause|ISC|CC0-1.0)"' \
        "${license_files[@]}" >/dev/null && \
      ! rg -i 'GPL|AGPL|LGPL|MPL|EPL|CDDL|commercial|proprietary|source-available|Business Source|Elastic License|Server Side Public License|SSPL' \
        "${license_files[@]}" >/dev/null; then
     license_mode="permissive"
   else
     license_mode="behavior-only"
   fi

   echo "license_mode=$license_mode"
   cat .tmp/editor-test-harvest-license/files.txt
   ```

3. Resolve the stable harvest directory, and the issue directories in issue mode:

   ```bash
   repo_key="$(basename "$target" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9._-' '-')"

   if [ "$license_mode" = "behavior-only" ]; then
     report_dir=".tmp/editor-test-harvester/${repo_key}"
   else
     report_dir="docs/editor-test-harvester/${repo_key}"
   fi
   mkdir -p "$report_dir"

   issue_report_dir="docs/editor-issue-harvester/${repo_key}"
   issue_raw_cache_dir=".tmp/editor-issue-harvester/${repo_key}/raw"
   mkdir -p "$issue_report_dir" "$issue_raw_cache_dir"
   ```

   For `owner/repo`, use the cloned basename as `<repo>`. An existing `report.md`, `inventory.md` or `test-index.md` makes the run an update: find new and removed test files, then rewrite the same files.

4. Capture repo basics:

   ```bash
   rg --files "$target" | rg '(^|/)(package.json|bun.lock|pnpm-lock.yaml|yarn.lock|vitest|jest|playwright|wdio|cypress)'
   ```

5. Build the exhaustive test inventory:

   ```bash
   rg --files "$target" \
     | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' \
     | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'
   ```

6. With `--issues`, build an all-state issue inventory before sampling, through `issue-harvester`'s archive input. Use `gitcrawl` first; when it cannot supply the corpus, record the fallback, state coverage, limit and freshness.
7. Cluster issues before deep reads: portable robustness (selection, IME, beforeinput, clipboard, history, decorations, voids and inlines, tables, collaboration, browser and mobile, large documents), `portable-mixed`, `plate-owned`, `skip` (framework internals, node-class mechanics, command registry, product shell, docs, release and support noise, stale duplicates) and `security-quarantine` (CVE, GHSA, exploit or sensitive-data reports, never routed through a normal harvest).
8. Classify every inventory row in the appendix:
   - `portable`: framework-agnostic editor behavior.
   - `portable-mixed`: raw behavior wrapped in framework or product policy that must be split first.
   - `plate-owned`: useful behavior whose owner is Plate, not raw Plite.
   - `skip`: framework internals, command registry, node-class mechanics, product UI, build tooling or harness only.
   - `harness`: a reusable testing technique without a product assertion.
   - `product-shell`: app or demo behavior outside the substrate.
   - `uncertain`: needs a read before routing.
9. Extract test names for every runnable portable, mixed and uncertain file: `rg -n "(describe|it|test)\\(" <target-test-files>`.
10. Read every portable and uncertain file, indexing huge files first. Before closure, reopen every runnable file whose test-name extraction found no tests: a body with only setup or a `TODO` is `harness`, and a route or demo that exists never counts as a behavior row.
11. Read representative open and closed issues from every kept cluster, keeping refs and short paraphrased behavior.
12. Extract behavior rows in behavior words, not upstream class names.
13. Search the Plate repo for equivalent coverage by behavior keywords and adjacent concepts, and Plate packages, kits, examples and docs for product behavior.
14. Assign one action per portable row:
    - `covered`: a current Plite or Plate test fully proves the invariant on the runtime's own output; a test whose harness reshapes input, output or selection before comparing is `refactor-existing` until the runtime emits that shape.
    - `refactor-existing`: related coverage needs a split, rename, stronger assertion or browser proof.
    - `create-new`: no adequate coverage; name the target location.
    - `copy-now`: the user asked to apply and the invariant is safe to implement now (a fresh proof for `behavior-only` sources).
    - `defer`: needs unavailable device, browser or tooling proof.
    - `plate-owned`: route to a Plate package, kit, example, docs or backlog owner.
    - `skip`: not portable after reading.

## Portable test taxonomy

Tags: `ime-composition`, `beforeinput-input`, `composition-selection-repair`, `selection-dom-mapping`, `clipboard-paste`, `drag-drop`, `history-undo-redo`, `normalization-schema`, `delete-backspace`, `insert-fragment`, `marks-inline`, `void-atom`, `tables-grid`, `decorations-overlays`, `collaboration-remote`, `performance-large-doc`, `accessibility-keyboard`, `serialization-parsing`, `browser-engine`, `mobile-device`, `focus-blur`, `shadow-dom`, `pagination-layout`, `structured-blocks`, `markdown-richtext-roundtrip`.

Portable examples: IME composition through marked text, decorations, void boundaries and undo; selection mapping around zero-width text, voids, inline boundaries and tables; browser-specific selection such as Firefox multi-range selections; native paste, drag, drop, beforeinput delete and compositionend ordering; undo granularity across composition, paste, delete and fragment insertion; fragment insertion across mixed inline, block and void boundaries; collaborative position mapping across concurrent edits and undo; pagination and layout behavior when the source proves editor semantics rather than appearance.

Source ranking for DOM selection: ProseMirror's `view/test/webtest-selection.ts` is the primary source for selection import and export, coordinates and fallback invariants; Lexical harvests shape browser regression rows and skip discipline; Tiptap's focus tests are focus-timing pressure only and never justify its command API.

Skip examples: React, Vue or Svelte integration internals; Lexical node-class lifecycle or ProseMirror plugin object mechanics; command registry wiring without observable behavior; tests of the upstream harness; demo chrome, menus, shortcuts or app UX; snapshot-only styling; `behavior-only` candidates that cannot be reduced to a fresh invariant.

Plate-owned examples: link and autolink grammar and nesting policy; list and checklist indentation, metadata, exit and ARIA policy; Markdown transformer UX, MDX and serializer choices; mention, hashtag, keyword, emoji, date-time, equation and media plugins; React plugin hosts, menus, typeahead, toolbar state and example apps; ProseMirror NodeView, MarkView, PluginView and plugin prop lifecycle ideas that improve Plate authoring; Tiptap-style extension, command and schema ergonomics.

## Output shape

The report is `<report_dir>/report.md` with companions `<report_dir>/inventory.md` and `<report_dir>/test-index.md`. File names carry no date; run dates, inventory commands, checkout path, source revision, license mode and license evidence live inside the report. Issue mode also writes `issues.md` (discovery commands, state coverage, total and returned counts, compact rows), `clusters.md` (cluster decisions and skip families) and `matrix.md` (kept invariants, Plite/Plate coverage, actions and proof commands) under `docs/editor-issue-harvester/<repo>/`, with raw cache in `.tmp/editor-issue-harvester/<repo>/raw/issues.json` and `issue-bodies/*.json`. A rerun rewrites these files in place with a note naming new and removed test files.

```markdown
# Editor Test Harvest: <repo>

status: pending|first-pass done|done
readiness: open|complete
license_mode: permissive|behavior-only
license_evidence: `<path/to/LICENSE or package metadata>`
output_mode: durable|scratch
versioned_copy_policy: normal|fresh-invariant-only

## Inventory

- target: `<path>`
- test files found: N
- portable: N
- portable-mixed: N
- plate-owned: N
- skipped: N
- harness/product/uncertain: N

## License Gate

| Field                 | Value                              |
| --------------------- | ---------------------------------- |
| License mode          | `permissive` or `behavior-only`    |
| Evidence files        | `<local paths>`                    |
| Output directory      | `docs/...` or `.tmp/...`           |
| Output mode           | `durable` or `scratch`             |
| Versioned copy policy | `normal` or `fresh-invariant-only` |

## Readiness Evidence

| Dimension | Status | Evidence or gap |
| --------- | ------ | --------------- |

## Pass-State Ledger

| Pass | Status | Evidence added | Report delta | Open issues | Next owner |
| ---- | ------ | -------------- | ------------ | ----------- | ---------- |

## Matrix

| Source ref       | Test ref   | Tag               | Behavior invariant | Proof kind              | Owner coverage                              | Action                                                 |
| ---------------- | ---------- | ----------------- | ------------------ | ----------------------- | ------------------------------------------- | ------------------------------------------------------ |
| `../lexical/...` | `test ref` | `ime-composition` | ...                | browser/unit/raw-device | `Plate repo root/...`, Plate owner, or none | covered/refactor-existing/create-new/defer/plate-owned |

## Skips

| Source           | Reason                                                       |
| ---------------- | ------------------------------------------------------------ |
| `../lexical/...` | Framework node-class invariant, no portable editor behavior. |

## Next Slice

1. Refactor existing ...
2. Create new ...
3. Defer raw-device ...

## Full Inventory Appendix

| Source | Runnable | Category | Reason | Test-name extraction |
| ------ | -------- | -------- | ------ | -------------------- |
```

A large appendix goes to `inventory.md`, linked from the report and never omitted. Apply runs edit tests only after the matrix exists, in slices small enough to verify. Comments in local tests explain the protected behavior, never upstream history.

## Verification

Report-only:

```bash
report_dir="docs/editor-test-harvester/<repo>"   # or .tmp/editor-test-harvester/<repo> for behavior-only
rg --files <target> | rg '<test inventory pattern>' | wc -l
rg -n "License Gate|Readiness Evidence|Pass-State Ledger|Matrix|Skips|Next Slice|Full Inventory Appendix" "$report_dir/report.md"
test -f "$report_dir/inventory.md"
test -f "$report_dir/test-index.md"
```

Issue mode:

```bash
issue_report_dir="docs/editor-issue-harvester/<repo>"
issue_raw_cache_dir=".tmp/editor-issue-harvester/<repo>/raw"

test -f "$issue_report_dir/issues.md"
test -f "$issue_report_dir/clusters.md"
test -f "$issue_report_dir/matrix.md"
test -d "$issue_raw_cache_dir"
rg -n "Issue State Coverage|Cluster Matrix|Slate/Plate Coverage|Next Slice" \
  "$issue_report_dir/issues.md" "$issue_report_dir/clusters.md" "$issue_report_dir/matrix.md"
rg -n "state: all|open \\+ closed|closed" "$issue_report_dir/issues.md" "$issue_report_dir/clusters.md"
! rg -n "bodyMarkdown|bodyText|comments\\s*:" "$issue_report_dir" 2>/dev/null
```

Versioned-output hygiene for `behavior-only` sources:

```bash
test ! -f "docs/editor-test-harvester/<repo>/inventory.md"
test ! -f "docs/editor-test-harvester/<repo>/test-index.md"
rg -n "copied from|verbatim|fixture copied|ported from" \
  docs packages apps content benchmarks tooling 2>/dev/null && \
  echo "Review versioned output for unsafe behavior-only wording" || true
```
