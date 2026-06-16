---
description: Mine external editor repositories and issue corpora for portable editor-behavior tests with ClawSweeper-style discipline, then optionally turn a completed harvest into a lane-specific Slate v2 or Plate plan that pauses for review before execution.
argument-hint: '[<repo-path-or-owner/repo> [--issues [--state all|open|closed]] [--apply] [surface/tag/filter] | plan <slate-v2|plate> <harvest-report-or-repo-key> | <harvest-report-or-repo-key> --lane <slate-v2|plate>]'
disable-model-invocation: true
name: editor-test-harvester
metadata:
  skiller:
    source: .agents/rules/editor-test-harvester.mdc
---

# Editor Test Harvester

Use this skill when mining another editor repository for tests worth harvesting:
Lexical, ProseMirror, CodeMirror, Tiptap, Monaco, Quill, or any local clone under
`..`.

The job is not to clone their framework. The job is to extract portable editor
behavior proof and route it to the right owner: raw Slate v2 substrate or Plate
packages, kits, examples, and docs.

When `--issues` is present, the job is to mine the target editor's issue corpus
for robustness pressure, not to mirror their backlog. Use open and closed issues
by default (`--state all`) unless the user explicitly narrows it. Cluster first,
skip unrelated issues hard, extract portable editor invariants, then map those
invariants to Slate v2/Plate coverage and proof targets.

For exhaustive issue-by-issue coverage closure, use `issue-harvester` after this
first-pass corpus and matrix work. `editor-test-harvester` owns inventory,
license/output mode, clustering, and invariant extraction. `issue-harvester`
owns ledger autodiscovery, latest issue refresh, closed-issue PR/test
provenance, unchecked-row processing, and local coverage checkmarks.

This follows the ClawSweeper method and the goal-plan confidence model:
source-first, exhaustive inventory, explicit skip reasons, evidence rows, scored
passes, narrow claims, license-aware invariant extraction, then implementation
only when asked.

When the user asks to process an existing harvest report into "all Slate tests",
"all Plate rows", "a lane plan", or "the execution plan", stay in this skill and
switch to lane-plan mode. Do not route to a separate wrapper. Lane-plan mode
reads the completed or near-complete harvest, accounts for every row, applies the
right downstream owner gates, writes a `docs/plans/*-harvest-plan.md`, and then
pauses for user review. It must not patch implementation code.

## Source Of Truth

Read these first:

1. The target repo license evidence: `LICENSE`, `LICENCE`, `COPYING`, `NOTICE`,
   package metadata, or workspace metadata.
2. The target editor repo, preferably a local checkout like `../lexical`.
3. `Plate repo root` current test files and package scripts.
4. Plate package/docs/example owners in this checkout when the behavior is a
   plugin, kit, UI, React integration, or product policy.
5. `docs/solutions/` for prior browser, IME, selection, and mobile proof lessons.
6. `.agents/skills/clawsweeper/SKILL.md` for issue/PR provenance discipline
   when a test exists because of a known upstream bug.
7. For lane-plan mode, the downstream lane skill:
   - `slate-v2`: `.agents/skills/slate-plan/SKILL.md`
   - `plate`: `.agents/skills/plate-plan/SKILL.md`

Never browse GitHub files. If the target is `owner/repo` and the checkout is
missing, clone it to `../repo-name`.

For issue-mode, GitHub issue data is candidate/provenance input, not
implementation source. Prefer `gitcrawl` or `gh` for issue metadata and comments
only; use the local target checkout for source/tests/license evidence.

## License Gate And Output Mode

Before harvesting behavior, classify the target repo license from local source
files only: `LICENSE`, `LICENCE`, `COPYING`, `NOTICE`, package metadata, or
workspace metadata.

Use one of these modes:

- `permissive`: MIT, BSD-2-Clause, BSD-3-Clause, Apache-2.0, ISC, CC0, or
  clearly equivalent permissive licensing.
- `behavior-only`: GPL, LGPL, AGPL, MPL, EPL, CDDL, proprietary, commercial,
  source-available, mixed/unclear licensing, missing license evidence, or any
  repo whose tests are not clearly permissively reusable.

Output location:

- `permissive`: write harvest artifacts under
  `docs/editor-test-harvester/<repo>/`.
- `behavior-only`: write harvest artifacts under
  `.tmp/editor-test-harvester/<repo>/`.
- `--issues`: write the durable issue workspace under
  `docs/editor-issue-harvester/<repo>/`, regardless of repository license mode.
  This workspace must contain compact issue rows, URLs, classifications,
  portable invariants, coverage decisions, and proof commands only. Keep raw
  GitHub issue bodies/comments, hydrated JSON, and source-adjacent cache under
  `.tmp/editor-issue-harvester/<repo>/raw/`.

`.tmp/editor-test-harvester/<repo>/` is unversioned scratch space. It may contain
source-adjacent notes, detailed provenance, raw local observations, and working
material needed to understand the source repo.

The strict invariant-only rule applies when producing versioned or durable
project output from a `behavior-only` source:

- Do not copy upstream test code, fixtures, helpers, snapshots, expected output
  blobs, or expressive test prose into Plate, Slate, docs, examples, commits, or
  PRs.
- Do not translate upstream code line-by-line into versioned local tests.
- Do not preserve upstream fixture shape in versioned output unless the shape is
  a generic factual editor state required to describe the behavior.
- Use source paths, minimal line references, and short paraphrased test labels
  as provenance in versioned output.
- Extract the behavior invariant, then write a fresh local proof using local
  Slate/Plate fixtures, names, helpers, and assertions.
- When in doubt about license mode, treat the source as `behavior-only`.

Rule of thumb: study the wound, don’t transplant the skin.

`behavior-only` does not block learning from non-permissive, source-available,
or unclear-license projects. It blocks copying into versioned Plate/Slate output.
The local proof should show that the implementation was independently expressed
from the invariant, not pasted or mechanically ported from upstream source.

## Core Rules

- License-gate the target before choosing the report directory.
- For permissive targets, write normal durable artifacts under
  `docs/editor-test-harvester/<repo>/`.
- For `behavior-only` targets, write unversioned scratch artifacts under
  `.tmp/editor-test-harvester/<repo>/`.
- For `behavior-only` targets, copying source material inside `.tmp` is allowed
  as scratch provenance, but copying it into versioned Plate, Slate, docs,
  examples, commits, or PRs is forbidden.
- For `behavior-only` targets, every versioned behavior row, implementation,
  docs note, and test must be rewritten as a fresh invariant in local language,
  with only source path/line provenance.
- Never claim an upstream test was copied from a `behavior-only` repo into
  versioned output. The valid versioned actions are invariant extraction, fresh
  local proof, defer, or skip.
- Build a complete target test-file inventory before reading favorite files.
- Store harvest artifacts in one stable repo folder chosen by license mode:
  `docs/editor-test-harvester/<repo>/` for permissive targets, or
  `.tmp/editor-test-harvester/<repo>/` for `behavior-only` targets.
- For `--issues` runs, store durable issue artifacts in one stable repo folder:
  `docs/editor-issue-harvester/<repo>/`. Do not add a `docs/research` wrapper
  layer for these ledgers. Use `.tmp/editor-issue-harvester/<repo>/raw/` only as
  transient corpus cache.
- Do not copy raw issue bodies/comments into versioned issue artifacts. Use issue
  URLs, issue numbers, short titles, classifications, fresh invariant wording,
  owner/proof decisions, and verification commands.
- For `behavior-only` targets, `inventory.md` and `test-index.md` also stay
  under `.tmp/editor-test-harvester/<repo>/`. Never create or refresh
  `docs/editor-test-harvester/<repo>/inventory.md`.
- Do not create dated report files under `docs/plans/` for normal harvest output.
- Reruns are idempotent. Read the existing repo folder first, rerun the source
  inventory, update the same files in place, and record new/removed source rows
  instead of creating a duplicate report.
- Every target test file ends in exactly one category: portable, portable-mixed,
  plate-owned, skip, harness, product-shell, or uncertain.
- Every skip gets a reason. "Looks internal" is too vague.
- Preserve the behavior invariant, not the upstream API shape.
- Do not paste upstream test code verbatim into versioned output. For
  `behavior-only` targets, do not paste, mechanically translate, or preserve
  upstream fixture/helper shape in versioned output. Write the strongest fresh
  local proof for the invariant, with source path references only.
- When a portable invariant is really a runtime-boundary problem, route it to a
  small fake-runtime or contract-test helper instead of a one-off smoke. The
  local proof should drive both sides: Slate/Plate sends the expected
  operation/event/request, and the fake host or peer returns deterministic data
  that proves the local behavior. Promote the helper only when repeated rows use
  the same boundary.
- Prefer DRY Slate coverage: if a related test exists, strengthen or split it
  instead of creating a duplicate.
- Use `plate-owned` when the useful behavior should fit Plate, not raw Slate.
  Examples: link/autolink grammar, list/checklist policy, markdown transformer
  UX, mention/hashtag/emoji/date-time plugins, media/product decorators,
  toolbar/menu state, React plugin hosts, NodeView/PluginView-style authoring,
  and rich product examples.
- Do not force Plate-owned rows into `Plate repo root`. Split substrate proof from
  plugin policy: raw Slate owns editor primitives; Plate owns opinionated
  features, integration ergonomics, and product-facing behavior.
- Browser, mobile, selection, clipboard, and IME claims need honest runtime
  proof. A jsdom composition test does not prove mobile/IME behavior.
- Do not edit `Plate repo root` unless the user asks for apply/copy/fix execution.
- In lane-plan mode, do not edit `Plate repo root`, Plate packages, apps, docs,
  examples, tests, package files, or build config. Planning mode writes only the
  plan and goal-plan evidence.
- In lane-plan mode, user phrases like "go", "process", "apply", or "all tests"
  do not override the review pause. Build the plan, write the accepted-plan
  execution handoff, and stop for user review before downstream execution.
- No GitHub comments, labels, commits, pushes, or PRs unless explicitly asked.
- In `--issues` mode, default to `--state all`. Closed issues are often the best
  source of regression stories, browser quirks, and already-fixed failure
  modes; open issues are not enough.
- In `--issues` mode, do not process issues one by one before clustering.
  Cluster by portable editor behavior first, then sample/read representatives.
- In `--issues` mode, skip Lexical/editor-specific API, node-class lifecycle,
  command registry, plugin packaging, product UX, docs, release, support, and
  framework-only issues unless they expose a raw editor primitive gap.
- In `--issues` mode, do not patch Slate from an issue title or body alone.
  Require a portable invariant plus current Slate/Plate coverage mapping.
- In `--issues` mode, a cluster matrix is not closure. It is only routing.
  After clustering, create an issue-by-issue closure ledger for every relevant
  issue. Each relevant issue needs a checkmark:
  `covered-by-existing-test`, `test-written`, `plate-owned-covered`, or
  `deferred-with-owner`. Invalid or unrelated issues need `invalid-skip` plus a
  reason. If the test already exists, link the exact local test and focused
  verification command. If no test exists, write the local test, run it, and
  check the issue only after proof passes or a real defer owner is recorded.
- Do not mark an all-issues harvest `done` from aggregate cluster coverage,
  matrix counts, or "recommended next slice" handoff. Use `pending` while any
  relevant issue lacks a per-issue checkmark.
- A single-pass matrix is a first-pass harvest, not a comprehensive harvest.
- Do not call a harvest comprehensive unless the pass schedule is complete, the
  score gates pass, and the report includes a full inventory appendix.
- Use `pending` while more autonomous harvest/review passes remain. Use `done`
  only after the closure score passes or when the user explicitly asked for a
  quick/first-pass report and the report says so in the verdict.

## Goal And Report State

Use an agent-native goal for comprehensive harvests, long-running reruns, and
apply runs. Always call `get_goal` first. Call `create_goal` only when no active
matching goal exists. There can be only one active goal per thread.

Create the harvest or lane-plan goal plan from the project template:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template editor-test-harvester \
  --title "<Repo> Editor Test Harvest"
```

For lane-plan mode, use the same template:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template editor-test-harvester \
  --title "<Lane> <Repo> Harvest Plan"
```

The generated `docs/plans` file is the durable pass-state ledger, scratch log,
decision record, verification ledger, and completion checklist. Do not create
hook state. Do not create or call a separate lane-plan template.

The harvest report itself still lives in the license-selected report directory:

- `permissive`: `docs/editor-test-harvester/<repo>/report.md`
- `behavior-only`: `.tmp/editor-test-harvester/<repo>/report.md`

Record this state in the active goal plan:

```md
target_repo: <path>
repo_key: <repo>
license_mode: permissive|behavior-only
output_mode: durable|scratch
report_path: <docs/.../report.md or .tmp/.../report.md>
inventory_path: <report_dir>/inventory.md
test_index_path: <report_dir>/test-index.md
issue_mode: yes|no
issue_state: all|open|closed
issue_report_dir: docs/editor-issue-harvester/<repo> or N/A
issue_raw_cache_dir: .tmp/editor-issue-harvester/<repo>/raw or N/A
issue_index_path: <issue_report_dir>/issues.md or N/A
issue_cluster_path: <issue_report_dir>/clusters.md or N/A
issue_matrix_path: <issue_report_dir>/matrix.md or N/A
current_pass: <pass-name>
current_pass_status: in_progress
current_pass_skill: .agents/skills/editor-test-harvester/SKILL.md
next_pass: <next-pass>
mode: harvest|issue-harvest|lane-plan
```

Set `done` only when:

- total score is `>= 0.92`;
- no dimension is below `0.85`;
- inventory count equals classified count;
- every runnable test file is either test-name indexed, read, or explicitly
  skipped as non-behavior with a reason;
- every portable and portable-mixed source has at least one behavior row or a
  recorded reason why its rows were rejected;
- every `covered`, `refactor-existing`, `create-new`, `copy-now`, `defer`, and
  `plate-owned` action has a raw Slate owner, Plate owner, or explicit gap;
- every create/copy/refactor/plate-owned row has an implementation target and
  verification command or a documented Plate backlog owner;
- the report has a full inventory appendix or a linked inventory file.

For lane-plan mode, set `done` only when:

- total score is `>= 0.92`;
- no dimension is below `0.85`;
- harvest report path and license mode are recorded;
- inventory and test-index status are recorded with missing-file reasons when
  absent;
- every harvest row is counted as in-lane, out-of-lane, split, duplicate, skip,
  or unresolved;
- no unresolved in-lane row remains;
- every in-lane row has owner coverage, action, target location, proof kind, and
  verification command or explicit defer reason;
- downstream lane gates are applied and recorded;
- behavior-only rows use fresh invariant wording only;
- the accepted-plan execution handoff is present;
- the final handoff pauses for user review before implementation.

If any gate fails but more work is possible, keep `pending` and write the active
goal plan with the next harvest pass. Use `blocked` only when the target repo,
Slate v2 checkout, required browser/device tooling, or a user decision is
missing and no useful autonomous pass remains.

## Confidence Score

Score each harvest pass from `0.00` to `1.00`.

| Dimension                                  | Weight |
| ------------------------------------------ | -----: |
| Inventory completeness                     |   0.20 |
| Behavior extraction depth                  |   0.20 |
| Skip precision and negative controls       |   0.15 |
| Slate/Plate coverage mapping accuracy      |   0.20 |
| Actionability of copy/refactor/create plan |   0.15 |
| Provenance and reproducibility             |   0.10 |

Score caps:

- Inventory completeness cannot exceed `0.75` unless the report records the
  exact inventory command, total count, classified count, and unresolved count.
- Inventory completeness cannot exceed `0.90` unless every test file path appears
  in a full inventory appendix or linked inventory file.
- Behavior extraction depth cannot exceed `0.75` if portable files were routed
  only by file name.
- Behavior extraction depth cannot exceed `0.85` unless all portable and
  portable-mixed runnable files have test-name extraction with line pointers.
- Behavior extraction depth cannot exceed `0.85` for `behavior-only` targets
  unless the report separates scratch provenance from versioned-output
  invariants.
- Skip precision cannot exceed `0.80` unless every skipped file or skip family
  has a concrete reason and at least one negative-control example was read.
- Slate/Plate coverage mapping cannot exceed `0.80` unless the report records
  the `Plate repo root` search commands for raw rows and the current Plate owner or
  explicit Plate gap for `plate-owned` rows.
- Actionability cannot exceed `0.80` unless every create/refactor/copy row names
  a target test file, proof kind, and focused verification command, and every
  `plate-owned` row names the likely Plate package, kit, example, docs, or
  backlog owner.
- Provenance cannot exceed `0.80` when issue/PR-linked upstream regression tests
  are used without ClawSweeper-style exact thread or local source rationale.
- Provenance cannot exceed `0.80` for `--issues` runs unless the report records
  issue state coverage (`all`, `open`, or `closed`), issue discovery command,
  cluster method, skip reasons, and representative issue refs for every kept
  cluster.
- Provenance cannot exceed `0.80` for `behavior-only` targets unless the report
  records license evidence, output directory, and versioned-output copy policy.
- The total score cannot exceed `0.88` if the report has no pass-state ledger.
- The total score cannot exceed `0.90` if the full inventory appendix is absent.

Completion threshold:

- total score `>= 0.92`;
- no dimension below `0.85`;
- no `uncertain` test files remain;
- no portable-mixed file remains unexamined;
- no create/refactor/copy/plate-owned row lacks a target owner;
- no browser/IME/mobile claim is based only on jsdom or synthetic model tests;
- pass-state ledger proves every pass completed before closure;
- for `--issues` runs, issue inventory count, issue state coverage,
  classification buckets, representative read count, cluster matrix, and
  Slate/Plate coverage mapping are recorded;
- for `behavior-only` targets, no versioned report, test, docs, fixture,
  snapshot, or implementation output contains copied or mechanically translated
  upstream source material.

Below threshold, the report can still be useful, but it must say `first-pass`,
`partial`, or `pending` and name the next owner.

## Pass Schedule

Run harvests as passes, not one giant skim:

1. Intake and boundary pass:
   - target repo path or clone target;
   - license evidence and license mode;
   - issue-mode decision, issue states, issue output directory, and explicit
     all-state coverage when `--issues` is present;
   - report directory selected from license mode;
   - surfaces in scope and explicit non-goals;
   - report-only vs apply;
   - browser/device availability.
2. Inventory pass:
   - find package manager and test harnesses;
   - build the full test inventory;
   - split actual runnable tests from fixtures/support files;
   - write every inventory row to the appendix with an initial category.
3. Issue inventory and cluster pass when `--issues` is present:
   - discover issues with `--state all` unless narrowed by the user;
   - write compact issue rows to
     `docs/editor-issue-harvester/<repo>/issues.md`;
   - write raw issue JSON, hydrated bodies, comments, and source-adjacent cache
     only to `.tmp/editor-issue-harvester/<repo>/raw/`;
   - cluster before deep reads;
   - classify clusters as portable, portable-mixed, plate-owned,
     framework-specific, product/support/docs/release, duplicate/stale,
     security-quarantine, or uncertain;
   - include closed issues and already-fixed reports as regression/proof
     pressure, not as closure claims.
4. Test-name extraction pass:
   - extract `describe` / `it` / `test` names for every runnable portable,
     portable-mixed, and uncertain file;
   - for huge files, index test names first, then read targeted ranges;
   - no portable-mixed file may stay summarized only by file name;
   - for `behavior-only` targets, record raw/source-adjacent extraction only in
     `.tmp`; convert anything that leaves `.tmp` into short paraphrased
     provenance.
5. Classification pressure pass:
   - challenge skips and product-shell routing;
   - read negative-control examples from each large skip family;
   - route every file to portable, portable-mixed, plate-owned, skip, harness,
     product-shell, or defer.
6. Behavior extraction pass:
   - turn source tests into behavior invariants;
   - turn kept issue clusters into behavior invariants only after source/test or
     current Slate coverage searches support the behavior;
   - attach source file, line, test name, tag, proof kind, browser/device
     requirements, and issue/PR rationale when present;
   - for `behavior-only` targets, scratch extraction may live in `.tmp`, but any
     versioned row or implementation must be rewritten as a fresh local
     invariant.
7. Slate/Plate coverage mapping pass:
   - search `Plate repo root` by behavior keywords and adjacent concepts;
   - search current Plate packages, docs, examples, and kits for plugin/product
     behavior;
   - map to exact current Slate tests, browser stress rows, Plate owners, docs,
     or explicit gaps;
   - do not use old plans as current coverage proof.
8. Action planning pass:
   - assign `covered`, `refactor-existing`, `create-new`, `copy-now`, `defer`,
     `plate-owned`, or `skip`;
   - for every non-covered row, name target package/browser/docs owner, proof
     kind, and verification command or backlog owner;
   - for `behavior-only` targets, `copy-now` means "write a fresh local proof
     from the invariant" when producing versioned output.
9. Ecosystem synthesis pass:
   - state what mechanism Slate should steal, reject, or deliberately diverge
     from;
   - state what mechanism Plate should own as product/plugin policy;
   - include browser/runtime/testing strategy, not just a source list.
10. Closure review pass:
   - score all dimensions with evidence;
   - record pass-state ledger;
   - list open gaps and next owner;
   - verify license-mode output placement;
   - set completion `done` only if gates pass.

Pass-state ledger rows must include:

- pass name;
- status: `pending`, `in_progress`, or `complete`;
- evidence added;
- report delta;
- open issues;
- next owner.

## Lane-Plan Mode

Use lane-plan mode after a completed or near-complete harvest report exists and
the user wants one owner lane processed into an execution-grade plan.

Examples:

```text
editor-test-harvester plan slate-v2 tiptap
editor-test-harvester plan slate-v2 .tmp/editor-test-harvester/name/report.md
editor-test-harvester docs/editor-test-harvester/tiptap/report.md --lane slate-v2
```

Lane registry:

| Lane       | Aliases                  | Downstream skill                     | Owner                                                                   | Output                                                       |
| ---------- | ------------------------ | ------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| `slate-v2` | `slate`, `raw-slate`     | `.agents/skills/slate-plan/SKILL.md` | Raw Slate v2 substrate in `Plate repo root`                               | `docs/plans/YYYY-MM-DD-slate-v2-<repo>-harvest-plan.md`      |
| `plate`    | `platejs`, `plate-owned` | `.agents/skills/plate-plan/SKILL.md` | Plate packages, kits, docs, examples, and product behavior in this repo | `docs/plans/YYYY-MM-DD-plate-<repo>-harvest-plan.md`         |

If the lane is unknown, infer only when harvest row owner labels make the
mapping obvious. Otherwise ask for the lane. Do not invent a new owner lane.

Lane-plan hard policy:

- Planning/routing only. Do not patch implementation code, tests, examples,
  package files, or build config.
- Preserve harvest license mode. Behavior-only rows in versioned plans use fresh
  invariant wording and source path provenance only.
- Do not count Plate/product rows as Slate v2 tests. Split mixed rows.
- Do not count raw Slate substrate rows as Plate backlog unless split and routed.
- "All lane tests" means every harvest row that belongs to the lane, including
  `covered`, `refactor-existing`, `create-new`, `fresh-invariant`, `copy-now`
  for permissive sources, `defer`, and unresolved lane candidates.
- Browser, clipboard, selection, mobile, and IME rows need honest proof routes.
  Package tests alone do not close browser/device claims.

Lane-plan workflow:

1. Resolve arguments: `plan <lane> <report-or-repo-key>` or
   `<report-or-repo-key> --lane <lane>`.
2. Resolve the harvest report:
   - explicit path wins;
   - else try `docs/editor-test-harvester/<repo>/report.md`;
   - else try `.tmp/editor-test-harvester/<repo>/report.md`;
   - else run or request harvest mode first.
3. Start or reuse an autogoal plan with `--template editor-test-harvester`.
4. Read harvest metadata: status, score, license mode, output mode, inventory
   counts, matrix rows, skips, next slice, and pass-state ledger.
5. Validate companion files: inventory exists or has a missing reason;
   test-index exists or has a missing reason.
6. Normalize lane aliases and select the lane registry row.
7. Account for every harvest row as:
   - `in-lane`: belongs to the requested owner lane;
   - `out-of-lane`: belongs to another owner;
   - `split`: contains both lane-owned substrate and product/plugin behavior;
   - `duplicate`: already represented by another row;
   - `skip`: no portable behavior;
   - `unresolved`: needs more reading or user decision.
8. For `slate-v2`, include raw editor substrate: selection DOM mapping,
   beforeinput/input, IME/composition, clipboard, paste, drag/drop, history,
   normalization, transforms, delete/backspace, insert fragment, marks/inline,
   void primitives, shadow DOM, browser engine behavior, focus/blur, and
   large-doc performance when the invariant is raw editor behavior.
9. For `slate-v2`, exclude or split product policy: links, lists, markdown UX,
   mention/hashtag/emoji/date-time plugins, media/product decorators,
   toolbar/menu/dialog state, React plugin hosts, and NodeView/PluginView-style
   authoring unless reduced to raw substrate.
10. Search current owner coverage before claiming covered or missing:
    - for `slate-v2`, search `Plate repo root` by behavior words and adjacent
      concepts, not upstream API names;
    - for `plate`, search packages, kits, docs, examples, and behavior-law docs.
11. Apply downstream lane gates:
    - `slate-v2`: load and apply `slate-plan` gates;
    - `plate`: load and apply `plate-plan` gates.
12. Fill the lane-plan sections in the template.
13. If below threshold, keep `pending` and name the next pass.
14. If threshold passes, set `done`, run `check-complete.mjs`, and produce the
    review handoff. Stop there. Do not execute implementation.

Lane-plan confidence score:

| Dimension                        | Weight |
| -------------------------------- | -----: |
| Harvest source readiness         |   0.15 |
| Lane-filter completeness         |   0.25 |
| Current owner coverage mapping   |   0.25 |
| Actionability of execution queue |   0.20 |
| License/provenance discipline    |   0.15 |

Score caps:

- Total cannot exceed `0.80` if the harvest report is missing.
- Total cannot exceed `0.86` if inventory or test-index status is unknown.
- Lane-filter completeness cannot exceed `0.80` unless every harvest matrix row
  is counted as in-lane or out-of-lane/split/duplicate/skip.
- Coverage mapping cannot exceed `0.85` unless current owner tests/source were
  searched in the target workspace.
- Actionability cannot exceed `0.85` unless every non-covered in-lane row names
  target file, proof kind, and focused verification command or defer reason.
- License/provenance cannot exceed `0.80` for behavior-only sources unless the
  plan states the fresh-invariant-only rule and avoids copied source wording.

Accepted-plan execution handoff must include:

- read-first plan path;
- requested lane;
- exact execution queue IDs;
- implementation boundaries;
- focused verification commands;
- broad final gate;
- issue/claim sync rule;
- stop rule.

The user reviews the finished plan first, then invokes the downstream lane skill
with the accepted plan path. This pause is the point of lane-plan mode.

## Discovery Workflow

1. Resolve the target repo:

   ```bash
   test -d ../lexical || git clone https://github.com/facebook/lexical.git ../lexical
   ```

2. Classify license mode before creating report artifacts:

   ```bash
   target="../lexical"

   mapfile -t license_files < <(
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

   If license evidence is missing, mixed, or unclear, use `behavior-only`.

3. Resolve the stable harvest directory:

   ```bash
   repo_key="$(basename "$target" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9._-' '-')"

   if [ "$license_mode" = "behavior-only" ]; then
     report_dir=".tmp/editor-test-harvester/${repo_key}"
   else
     report_dir="docs/editor-test-harvester/${repo_key}"
   fi

   mkdir -p "$report_dir"
   ```

   For issue-mode, also resolve the durable issue directory and raw cache:

   ```bash
   issue_report_dir="docs/editor-issue-harvester/${repo_key}"
   issue_raw_cache_dir=".tmp/editor-issue-harvester/${repo_key}/raw"
   mkdir -p "$issue_report_dir"
   mkdir -p "$issue_raw_cache_dir"
   ```

   For `owner/repo` targets, use the cloned repo basename as `<repo>`. If
   `report.md`, `inventory.md`, or `test-index.md` already exists in the chosen
   license-mode report directory, read them before inventory and treat the run
   as an update. The rerun must look for new and removed test files in the target
   checkout, then rewrite the same stable files.

4. Capture repo basics without starting with git state:

   ```bash
   rg --files "$target" | rg '(^|/)(package.json|bun.lock|pnpm-lock.yaml|yarn.lock|vitest|jest|playwright|wdio|cypress)'
   ```

5. Build the exhaustive test inventory:

   ```bash
   rg --files "$target" \
     | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec)\.[cm]?[jt]sx?$' \
     | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'
   ```

6. For `--issues`, build an all-state issue inventory before sampling:

   ```bash
   issue_state="${issue_state:-all}"
   issue_report_dir="docs/editor-issue-harvester/${repo_key}"
   issue_raw_cache_dir=".tmp/editor-issue-harvester/${repo_key}/raw"

   gitcrawl search issues "" -R <owner/repo> --state "$issue_state" \
     --json number,title,state,url,labels,updatedAt --limit 1000 \
     > "$issue_raw_cache_dir/issues.json"
   ```

   If `gitcrawl` cannot provide the target repo corpus, use `gh search issues`
   or the best available local issue archive. Record the fallback, state
   coverage, limit, and freshness. Do not claim comprehensive all-state coverage
   if the command only returned a truncated subset.

7. Cluster issue rows before deep reads:

   - portable editor robustness: selection, IME/composition, beforeinput,
     clipboard, history, decorations, void/inline, tables, collaboration,
     browser/mobile, large-doc performance;
   - portable-mixed: useful editor invariant wrapped in product/framework
     context;
   - plate-owned: plugins, markdown, links, lists, media, menus, examples, or
     product API/DX;
   - skip: framework internals, node-class mechanics, command registry, product
     shell, docs/release/support noise, duplicate/stale with no portable
     invariant;
   - security-quarantine: CVE/GHSA/exploit/sensitive-data style reports; do not
     route through normal robustness harvest.

8. Classify every inventory row and record it in the appendix:

   - `portable`: proves framework-agnostic editor behavior.
   - `portable-mixed`: contains raw editor behavior plus framework/product
     policy that must be split before action.
   - `plate-owned`: useful behavior, but the right owner is Plate, not raw
     Slate v2.
   - `skip`: framework internals, command registry, node-class mechanics,
     product UI, build tooling, or test harness only.
   - `harness`: reusable testing technique, but no product behavior assertion.
   - `product-shell`: app/demo behavior outside raw editor substrate.
   - `uncertain`: needs a read before routing.

9. Extract test names for all runnable portable, portable-mixed, and uncertain
   files:

   ```bash
   rg -n "(describe|it|test)\\(" <target-test-files>
   ```

10. Read all portable and uncertain files. For huge files, index test names first,
    then read the relevant ranges.

11. Read representative issues from every kept issue cluster. Include both open
    and closed examples when all-state mode finds both. Preserve issue refs and
    short paraphrased behavior, not expressive issue prose.

12. Extract behavior rows. Use behavior words, not upstream class names.

13. Search `Plate repo root` for equivalent coverage using behavior keywords and
    adjacent concepts. Do not stop at exact upstream names.

14. Search Plate packages, kits, examples, and docs when behavior belongs to
    product/plugin policy rather than raw Slate substrate.

15. Assign one owner action per portable row:

- `covered`: current Slate v2 or Plate test fully proves the invariant.
- `refactor-existing`: related coverage exists but needs split, rename,
  stronger assertions, or browser proof.
- `create-new`: no adequate coverage; propose the target test location.
- `copy-now`: user asked to apply, the invariant is safe to implement now,
  and the target is permissive. For `behavior-only` targets, this means
  "write a fresh local proof from the invariant" for versioned output, never
  copy upstream code, fixtures, snapshots, helpers, or expressive prose into
  Plate, Slate, docs, examples, commits, or PRs.
- `defer`: requires unavailable raw device/browser/tooling proof.
- `plate-owned`: route to Plate package, kit, example, docs, or backlog owner.
- `skip`: after reading, it is not portable enough.

## Portable Test Taxonomy

Use these tags consistently:

- `ime-composition`
- `beforeinput-input`
- `composition-selection-repair`
- `selection-dom-mapping`
- `clipboard-paste`
- `drag-drop`
- `history-undo-redo`
- `normalization-schema`
- `delete-backspace`
- `insert-fragment`
- `marks-inline`
- `void-atom`
- `tables-grid`
- `decorations-overlays`
- `collaboration-remote`
- `performance-large-doc`
- `accessibility-keyboard`
- `serialization-parsing`
- `browser-engine`
- `mobile-device`
- `focus-blur`
- `shadow-dom`
- `pagination-layout`
- `structured-blocks`
- `markdown-richtext-roundtrip`

Portable examples:

- IME composition through marked text, decorations, void boundaries, and undo.
- Selection mapping around zero-width text, voids, inline boundaries, and tables.
- Browser-specific selection behavior such as Firefox multi-range selections.
- Native paste, drag, drop, beforeinput delete, and compositionend ordering.
- Undo granularity across composition, paste, delete, and fragment insertions.
- Fragment insertion through mixed inline/block/void boundaries.
- Collaborative position mapping across concurrent insert/delete and undo.
- Pagination and deterministic layout behavior when the source proves editor
  semantics rather than renderer-only appearance.

Skip examples:

- React/Vue/Svelte integration internals.
- Lexical node-class lifecycle or ProseMirror plugin object mechanics.
- Command registry wiring with no observable editor behavior.
- Test utility tests that prove only the upstream harness.
- Product demo chrome, menus, shortcuts, or app-specific UX policy.
- Snapshot-only styling assertions with no editor behavior invariant.
- Versioned-output candidates from `behavior-only` repos that cannot be reduced
  to a fresh invariant without preserving expressive source material.

Plate-owned examples:

- Link/autolink grammar, link-splitting policy, and no-nested-link decisions.
- List/checklist indentation, ordered metadata, list-exit, and ARIA policy.
- Markdown transformer UX, MDX/custom transformers, and serializer choices.
- Mention, hashtag, keyword, emoji, date-time, equation, and media plugins.
- React plugin hosts, menus, typeahead, toolbar state, and example app behavior.
- ProseMirror NodeView, MarkView, PluginView, and plugin prop lifecycle ideas
  when they improve Plate authoring but should not become raw Slate API.
- Tiptap-style extension ergonomics, command ergonomics, and schema packaging
  when the behavior is developer-product surface rather than raw editor truth.

## Output Shape

For report-only runs, choose the output directory by license mode:

```text
# permissive
docs/editor-test-harvester/<repo>/report.md

# behavior-only
.tmp/editor-test-harvester/<repo>/report.md
```

`behavior-only` reports are unversioned scratch artifacts. They may contain
detailed local research notes. They must not be copied into durable project docs
without rewriting into fresh invariant language.

Use stable companion files in the same directory:

```text
<report_dir>/inventory.md
<report_dir>/test-index.md
```

For `behavior-only` targets, `<report_dir>` means
`.tmp/editor-test-harvester/<repo>`. Do not write inventory or test-index files
to `docs/editor-test-harvester/<repo>/`.

Do not include the date in file names. Put run dates, inventory commands, source
checkout path, source revision/provenance, license mode, and license evidence
inside the report instead.

For `--issues` runs, write these durable companions:

```text
docs/editor-issue-harvester/<repo>/issues.md
docs/editor-issue-harvester/<repo>/clusters.md
docs/editor-issue-harvester/<repo>/matrix.md
```

`issues.md` records discovery commands, state coverage, total/returned counts,
and compact issue rows. `clusters.md` records cluster decisions and skip
families. `matrix.md` records kept portable invariants, Slate/Plate coverage,
actions, and proof commands. They are durable because they are compact local
classification artifacts, not raw copied issue threads.

Raw issue cache stays here:

```text
.tmp/editor-issue-harvester/<repo>/raw/issues.json
.tmp/editor-issue-harvester/<repo>/raw/issue-bodies/*.json
```

If a previous harvest exists in the chosen license-mode report directory, rewrite
these files in place and add a rerun/update note that names newly discovered and
removed target test files.

Use this shape:

```markdown
# Editor Test Harvest: <repo>

status: pending|first-pass done|done
score: 0.xx
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

For `behavior-only` targets, this report is scratch material. Anything promoted
from it into versioned Plate/Slate output must be rewritten as a fresh invariant
and local proof.

## Confidence Score

| Dimension | Score | Evidence | Cap hit |
| --------- | ----: | -------- | ------- |

## Pass-State Ledger

| Pass | Status | Evidence added | Report delta | Open issues | Next owner |
| ---- | ------ | -------------- | ------------ | ----------- | ---------- |

## Matrix

| Source ref       | Test ref   | Tag               | Behavior invariant | Proof kind              | Owner coverage                            | Action                                                 |
| ---------------- | ---------- | ----------------- | ------------------ | ----------------------- | ----------------------------------------- | ------------------------------------------------------ |
| `../lexical/...` | `test ref` | `ime-composition` | ...                | browser/unit/raw-device | `Plate repo root/...`, Plate owner, or none | covered/refactor-existing/create-new/defer/plate-owned |

For `behavior-only` targets, `Source ref` and `Test ref` are scratch provenance.
Any versioned output derived from `Behavior invariant` must be rewritten locally.

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

If the inventory appendix is too large, write it to:

```text
<report_dir>/inventory.md
```

Then link it from the main report. Do not omit it.

Write the extracted portable/portable-mixed test-name index to:

```text
<report_dir>/test-index.md
```

For apply runs, edit `Plate repo root` or Plate tests only after the matrix exists.
Keep the implementation slice small enough to verify.

Source comments are useful only when they explain the behavior being protected.
Do not make tests read like upstream changelogs. For `behavior-only` targets,
source comments in versioned output must not quote or closely paraphrase
upstream test bodies, fixtures, snapshots, expected output blobs, or expressive
prose.

## Verification

Report-only verification:

```bash
# Set this from the license gate.
# permissive:
report_dir="docs/editor-test-harvester/<repo>"

# behavior-only:
report_dir=".tmp/editor-test-harvester/<repo>"

rg --files <target> | rg '<test inventory pattern>' | wc -l
rg -n "License Gate|Confidence Score|Pass-State Ledger|Matrix|Skips|Next Slice|Full Inventory Appendix" "$report_dir/report.md"
test -f "$report_dir/inventory.md"
test -f "$report_dir/test-index.md"
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<goal-plan>.md
```

Issue-mode verification:

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

Lane-plan verification:

```bash
rg -n "Lane contract|Full harvest row accounting|In-lane candidate matrix|Execution queue|Downstream lane application|Accepted-plan execution handoff|review" docs/plans/<plan>.md
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<plan>.md
```

Versioned-output hygiene check for behavior-only sources:

```bash
test ! -f "docs/editor-test-harvester/<repo>/inventory.md"
test ! -f "docs/editor-test-harvester/<repo>/test-index.md"
rg -n "copied from|verbatim|fixture copied|ported from" \
  docs packages apps content benchmarks tooling 2>/dev/null && \
  echo "Review versioned output for unsafe behavior-only wording" || true
```

Implementation verification in Slate v2 packages or Plate:

- Run the focused package or browser test that owns the new proof.
- Run `pnpm slate:packages:test` before claiming a Slate applied slice is closed.
- For release-quality Slate browser claims, pair package proof with
  `pnpm --filter www test:slate-browser`.
- Use raw mobile proof only when real device/Appium artifacts exist; semantic
  mobile handles and Playwright mobile viewports are not raw-device proof.
- For `behavior-only` sources, verify that versioned local tests use local
  fixtures, helpers, names, and assertions, not upstream test code or
  mechanically ported fixture shape.

## ClawSweeper Use

Use ClawSweeper as the model for provenance work. If a test points at an
upstream issue, PR, browser bug, or closed-thread rationale, apply the
ClawSweeper bar: exact thread, exact behavior, no speculative closure claim, and
no broad claim without current source proof.

When local issue archaeology is useful, use the gitcrawl command surface through
that ClawSweeper discipline. In issue-mode, use `--state all` by default:

```bash
gitcrawl doctor --json
gitcrawl search issues "<behavior phrase>" -R <owner/repo> --state all --json number,title,state,url --limit 20
gitcrawl sync <owner/repo> --numbers <issue-or-pr-number> --with pr-details --json
```

Treat gitcrawl as provenance and candidate generation only. The target repo test
inventory still owns coverage accounting.

For broad issue-mode discovery, first try an all-state corpus command, then
cluster:

```bash
gitcrawl search issues "" -R <owner/repo> --state all \
  --json number,title,state,url,labels,updatedAt --limit 1000
```

If empty-query search is unsupported, use durable clusters, known labels, broad
editor-behavior keyword searches, or `gh search issues` in batches. Record that
the result is a sampled corpus, not full all-issue coverage.

For `behavior-only` targets, issue/PR provenance may identify why a behavior
matters, but it still must not justify copying upstream code, fixtures,
snapshots, expected output blobs, or expressive test prose into versioned output.
Extract the invariant. Write the local proof fresh.
