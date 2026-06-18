---
description: Turn an editor-test-harvester report into one lane-specific execution plan, e.g. process every Slate v2 candidate from a harvest through slate-plan without executing implementation.
argument-hint: '[<lane> <harvest-report-or-repo-key> | <harvest-report-or-repo-key> --lane <lane>]'
disable-model-invocation: true
name: editor-harvest-plan
metadata:
  skiller:
    source: .agents/rules/editor-harvest-plan.mdc
---

# Editor Harvest Plan

Handle $ARGUMENTS.

Use this after `editor-test-harvester` has produced a report and the user wants
one owner lane processed into an execution-grade plan.

Examples:

```text
editor-harvest-plan slate-v2 tinymce
editor-harvest-plan slate-v2 .tmp/editor-test-harvester/tinymce/report.md
editor-harvest-plan docs/editor-test-harvester/tiptap/report.md --lane slate-v2
```

For `slate-v2`, this means: read the harvest, find every raw Slate candidate,
apply `slate-plan`, and produce a plan that accounts for all Slate-specific
tests. It does not mean blindly port every upstream test.

## Use When

- A completed or near-complete `editor-test-harvester` report exists.
- The user wants all rows for one lane processed, such as `slate-v2` or `plate`.
- The user asks "all Slate tests from this harvest", "all Plate-owned rows", or
  "process this harvester result into a plan".
- The output should be a `docs/plans/*-harvest-plan.md` execution plan with an
  accepted-plan handoff for the downstream lane skill.
- The source may be `behavior-only`, so versioned output must stay
  fresh-invariant-only.

## Do Not Use When

- The user asks to mine a source repo from scratch. Use `editor-test-harvester`.
- The user asks to execute an accepted plan. Invoke the downstream lane skill
  against the accepted plan.
- The user asks for one narrow bug fix or a direct code/test patch.
- The harvest has no report, no inventory, and no test index. Run or request
  `editor-test-harvester` first.

## Lane Registry

| Lane       | Aliases                  | Downstream skill                     | Owner                                                                   | Output                                                       |
| ---------- | ------------------------ | ------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| `slate-v2` | `slate`, `raw-slate`     | `.agents/skills/slate-plan/SKILL.md` | Raw Slate v2 substrate in `Plate repo root`                               | `docs/plans/YYYY-MM-DD-slate-v2-<repo>-harvest-plan.md`      |
| `plate`    | `platejs`, `plate-owned` | `.agents/skills/plate-plan/SKILL.md` | Plate packages, kits, docs, examples, and product behavior in this repo | `docs/plans/YYYY-MM-DD-plate-<repo>-harvest-plan.md`         |

If the lane is unknown, infer only when the harvest row owner labels make the
mapping obvious. Otherwise ask for the lane. Do not invent a new owner lane and
pretend it is covered.

## Hard Policy

- This is a planning/routing skill. Do not patch implementation code, tests,
  examples, package files, or build config.
- For `slate-v2`, do not edit `Plate repo root` from this skill.
- For `plate`, do not edit packages, apps, docs, examples, or behavior from this
  skill except the plan.
- User phrases like "go", "process", "apply", or "all tests" do not override
  the planning boundary. Build the plan and hand execution to the downstream
  lane skill after user acceptance.
- Do not rerun the full harvest unless the report is missing required evidence.
  If the harvest is incomplete but usable, process what exists and keep the plan
  `pending` with the missing harvester pass named.
- Preserve license mode from the harvest. For `behavior-only` sources, any
  versioned plan row must use fresh local invariant wording and source path
  provenance only.
- Never copy upstream test code, fixtures, helpers, snapshots, expected output,
  or expressive prose into versioned output.
- Do not count Plate/product rows as Slate v2 tests.
- Do not count raw Slate substrate rows as Plate plugin backlog unless they were
  explicitly split and routed.
- "All lane tests" means every harvest row that belongs to the lane, including
  `covered`, `refactor-existing`, `create-new`, `fresh-invariant`, `copy-now`
  for permissive sources, `defer`, and unresolved lane candidates. It is not
  limited to `create-new`.
- Browser, clipboard, selection, mobile, and IME rows need honest proof routes.
  Package tests alone do not close browser/device claims.

## Read First

1. Latest user request and lane argument.
2. Active goal and active `docs/plans` goal plan, if present.
3. The harvest report:
   - explicit report path, or
   - `docs/editor-test-harvester/<repo>/report.md`, or
   - `.tmp/editor-test-harvester/<repo>/report.md`.
4. Companion harvest files when present:
   - `<report_dir>/inventory.md`
   - `<report_dir>/test-index.md`
5. `.agents/skills/editor-test-harvester/SKILL.md`.
6. The downstream lane skill:
   - `slate-v2`: `.agents/skills/slate-plan/SKILL.md`
   - `plate`: `.agents/skills/plate-plan/SKILL.md`
7. `docs/solutions/` entries about editor harvest routing, browser proof, IME,
   selection, placeholders, and Skiller/sync failures.
8. Current owner evidence:
   - `slate-v2`: `Plate repo root` tests, examples, package scripts, and relevant
     ledgers.
   - `plate`: current Plate packages, kits, docs, examples, and behavior-law
     docs.

For `slate-v2`, the live `Plate repo root` checkout wins over stale plans. Search
current tests and source before saying a row is covered or missing.

## Goal And Plan State

This skill uses agent-native goals for durable state. Always call `get_goal`
first. Call `create_goal` only when no active matching goal exists. There can be
only one active goal per thread.

Create the lane plan from the project template:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template editor-harvest-plan \
  --title "<Lane> <Repo> Harvest Plan"
```

The generated `docs/plans` file is the durable evidence and pass-state ledger.
Do not create hook state.

Complete the goal only when the plan records:

- harvest report path and license mode;
- inventory and test-index status, including missing-file reasons;
- every harvest row accounted for as in-lane, out-of-lane, split, duplicate,
  skip, or unresolved;
- every in-lane row with owner coverage, action, target location, proof kind,
  and verification command or explicit defer reason;
- downstream lane gates applied and recorded;
- pass-state ledger, confidence score, lane queue, excluded rows, issue/claim
  accounting, and accepted-plan execution handoff;
- no behavior-only source material copied or mechanically translated into
  versioned output;
- no row that still needs autonomous routing;
- `node .agents/skills/autogoal/scripts/check-complete.mjs <plan>` passing.

Keep `pending` while any lane row can still be mapped, deduped, split, or routed.
Use `blocked` only when the harvest artifact, target checkout, browser/device
proof, or user lane decision is missing and no useful autonomous pass remains.

## Confidence Score

Score from `0.00` to `1.00`.

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
- License/provenance cannot exceed `0.80` for `behavior-only` sources unless
  the plan states the fresh-invariant-only rule and avoids copied source
  wording.

Completion threshold:

- total score `>= 0.92`;
- no dimension below `0.85`;
- no unresolved in-lane row;
- no `create-new`, `refactor-existing`, `copy-now`, `fresh-invariant`, or
  `defer` row lacks owner and verification/defer evidence;
- downstream lane application recorded;
- final goal-plan check passes.

## Workflow

1. Resolve arguments:
   - lane first, then report/repo key; or
   - report/repo key plus `--lane <lane>`.
2. Resolve the harvest report:
   - explicit path wins;
   - else try `docs/editor-test-harvester/<repo>/report.md`;
   - else try `.tmp/editor-test-harvester/<repo>/report.md`;
   - else run or request `editor-test-harvester` first.
3. Start or reuse a matching goal, then create the plan with
   `--template editor-harvest-plan`.
4. Read harvest metadata:
   - status;
   - score;
   - license mode;
   - output mode;
   - inventory counts;
   - matrix rows;
   - skips;
   - next slice;
   - pass-state ledger.
5. Validate companion files:
   - inventory exists or missing reason;
   - test-index exists or missing reason.
6. Normalize lane aliases.
7. Build row accounting:
   - `in-lane`: belongs to the requested owner lane;
   - `out-of-lane`: belongs to another owner;
   - `split`: contains both lane-owned substrate and product/plugin behavior;
   - `duplicate`: already represented by another row;
   - `skip`: no portable behavior;
   - `unresolved`: needs more reading or user decision.
8. For `slate-v2`, include every row whose tag, owner coverage, action, target,
   or behavior invariant points to raw Slate substrate:
   - selection DOM mapping;
   - beforeinput/input;
   - IME/composition;
   - clipboard, paste, drag, drop;
   - history undo/redo;
   - normalization and transforms;
   - delete/backspace;
   - insert fragment;
   - marks/inline/void primitives;
   - shadow DOM;
   - browser engine behavior;
   - focus/blur;
   - performance-large-doc when the invariant is raw editor substrate.
9. For `slate-v2`, exclude or split:
   - link/autolink grammar;
   - list/checklist policy;
   - markdown transformer UX;
   - mention/hashtag/emoji/date-time plugins;
   - media/product decorators;
   - toolbar/menu/dialog state;
   - React plugin hosts;
   - NodeView/PluginView-style authoring unless reduced to raw substrate.
10. Search current owner coverage:
    - for `slate-v2`, search `Plate repo root` by behavior words and adjacent
      concepts, not upstream API names;
    - for `plate`, search packages, kits, docs, examples, and behavior-law docs.
11. Apply the downstream lane skill:
    - for `slate-v2`, load and apply `slate-plan` gates to the lane plan;
    - for `plate`, load and apply `plate-plan` gates to the lane plan.
12. Fill the template sections under `docs/plans/`.
13. If the plan is below threshold, keep `pending` and name the next pass.
14. If the plan passes threshold, set `done`, run `check-complete.mjs`, and
    produce the user-review handoff. Do not execute implementation.

## Action Values

- `covered`
- `refactor-existing`
- `create-new`
- `copy-now` for permissive sources only
- `fresh-invariant` for behavior-only sources
- `defer`
- `split`
- `skip`

For `behavior-only` sources, never use `copy-now` in versioned output. Use
`fresh-invariant`.

## Issue And Claim Accounting

Default to no issue claim.

For `slate-v2`, apply `slate-plan` issue rules:

- fixed issue claims need exact proof and issue ledger sync;
- improved issues need material behavior proof;
- related issues stay related when the exact repro is not proven;
- no broad GitHub discovery unless the downstream skill allows it;
- update PR/issue ledgers only when the plan changes claim text or proof
  status.

If no claim changes, write:

```md
Fixed issues: none from this plan.
Improved issues: none from this plan.
Related issues: unchanged; this plan routes harvested test pressure only.
PR reference: unchanged; no claim or proof status changed.
```

## Accepted-Plan Execution Handoff

When the lane plan is ready, write a handoff that the downstream lane skill can
execute after user acceptance:

- read-first plan path;
- requested lane;
- exact execution queue IDs;
- implementation boundaries;
- focused verification commands;
- broad final gate;
- issue/claim sync rule;
- stop rule.

Do not start execution from this skill. The user reviews the finished plan
first, then invokes the downstream lane skill again with the accepted plan path.

## Verification

Planning-only verification in `plate-2`:

```bash
rg -n "Harvest grounding|Lane contract|Full harvest row accounting|In-lane candidate matrix|Execution queue|Downstream lane application|Accepted-plan execution handoff" docs/plans/<plan>.md
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<plan>.md
```

Source sync verification after editing this skill:

```bash
pnpm install
test -f .agents/skills/editor-harvest-plan/SKILL.md
rg -n "editor-test-harvester|slate-plan|Lane Registry|Full harvest row accounting" .agents/skills/editor-harvest-plan/SKILL.md
pnpm lint:fix
```

Slate v2 behavior verification belongs only to accepted-plan execution from
`Plate repo root`.

## Final Response

If pending:

```md
Editor Harvest Plan is pending: [docs/plans/...](docs/plans/...)

Score: 0.xx
Next owner: ...
```

If done:

```md
Editor Harvest Plan is ready: [docs/plans/...](docs/plans/...)

Lane processed:

- `<lane>`: N in-lane rows, N covered, N refactor, N create/fresh-invariant,
  N defer, N excluded/out-of-lane.
- Downstream skill: `<skill>`.
- Execution next: `<first execution queue id or none>`.
```
