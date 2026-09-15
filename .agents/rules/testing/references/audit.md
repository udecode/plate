# Testing audit
Apply [the Plate workflow](../../task/references/workflow.md) for plan, authority, proof and review ownership.


Review the repo test suite from current reality, not stale vibes.

Use this when you want a periodic testing audit, a fresh coverage map, or a new next-batch recommendation before a breaking-change wave.

## Goal

- rerun fresh repo coverage
- inspect test-suite health
- score remaining files by real regression value
- publish the next recommended batch
- stop fake work before it starts

This workflow is audit-first. Do not implement the recommended tests unless the user explicitly asks for execution.

## Inputs

- `@.agents/rules/task.mdc`
- `@.agents/rules/testing.mdc`

## Core Rules

- Use fresh `lcov` as source of truth.
- Score files, not just packages.
- Do not default to package sweeps once the obvious package-wide passes are spent.
- Prefer file-ranked batches across packages when the remaining value is scattered.
- Only recommend a package sweep when a package is still largely untouched and contains multiple top-ranked boundaries.
- Lock a roadmap for the current review phase instead of re-inventing the next batch on every pass.
- Future passes should update roadmap status in place unless the candidate set materially changes.
- Do not permanently exclude `/react`. Only exclude it when the current review explicitly says so.
- Penalize wrappers, crumbs, giant sludge files, and likely-dead code.
- Reward deterministic transforms, queries, merge helpers, parser/serializer boundaries, plugin resolution, normalization, and public editor contracts.
- Coverage is regression telemetry, not a KPI.
- If the remaining misses are mostly low-ROI dust, say stop.

## Workflow

### 1. Refresh Coverage

Run fresh repo coverage with a date-stamped output directory:

```bash
bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-YYYY-MM-DDx --reporter=dots
```

Capture:

- pass/fail count
- file count
- runtime
- `lcov.info` path

### 2. Inspect Suite Health

Run the fast-lane timing checks:

```bash
pnpm test:profile -- --top 25
pnpm test:slowest -- --top 25
```

Then scan for stale suite debt:

```bash
rg -n "describe\\.skip|it\\.skip|test\\.skip|xit\\(|xdescribe\\(" packages apps
rg -n "^\\s*//\\s*(describe|it|test)\\(" packages apps -g "*.spec.ts" -g "*.spec.tsx"
rg -n "from '.*\\.spec'" packages apps -g "*.spec.ts" -g "*.spec.tsx"
```

Only report debt that is actually worth fixing.

### 3. Score Remaining Files

Score every remaining `packages/**/src/**` file for worth-testing value.

Exclude by default:

- test files
- barrels
- declaration files
- obvious type-only files
- generated junk
- zero-value crumbs

Scoring should reflect:

- boundary type
- runtime coverage
- uncovered behavior
- likely regression value during breaking changes
- test ROI

When recommending the next batch:

- prefer the best files across packages over "do package X next"
- call out when package totals are inflated by crumbs, wrappers, or giant low-ROI leftovers
- say explicitly when a package sweep would be dumb

### 4. Write Artifacts

Write:

- a markdown map under `docs/plans/`
- a package TSV
- a file TSV
- a locked roadmap markdown file when this is the first meaningful pass for the current phase, or update that roadmap if it already exists

The markdown map should include:

- fresh coverage result
- scoring rules
- strict next batch
- wider next batch if still defensible
- package ranking
- file ranking
- stop condition
- clear caveats about fake-high package totals

The roadmap should include:

- the frozen threshold for the current phase
- the execution queue in stable order
- explicit deferrals with reasons
- status for each queued or deferred file
- an update rule that says future passes mark items done, removed, or deferred instead of reshuffling the whole list

### 5. Final Recommendation

Answer with:

- what the real next batch is
- whether to keep pushing coverage or stop
- what should be deferred by design

## Output Standard

Use blunt rankings, not mush.

Say things like:

- `core first, then markdown, then diff`
- `do not do another package sweep`
- `the best next files are split across packages, so do not sweep package X`
- `this roadmap is locked for the current phase; future passes update status, not the whole ranking`
- `this file is uncovered but not worth touching`
- `stop after the >= 5 batch`

## Stop Conditions

Recommend stopping when the remaining misses are mostly:

- wrappers
- provider/store dust
- DOM-only boundaries
- giant low-ROI files
- tiny uncovered crumbs
- code likely to be rewritten soon

At that point, tell the user to switch from coverage work to architecture-safety work.

## Coverage Strategy

- Coverage is for regression detection during breaking changes and rearchitecture, not for winning a percentage contest.
- Rank files from fresh `lcov`. Trust file order more than package totals.
- Work in passes:
  1. high-value contract pass: do every honest file with score `>= 6`
  2. medium-value follow-up: rerun coverage, then do worthwhile `>= 5` files while skipping crumbs, wrappers, and sludge
  3. architecture-safety pass: stop following coverage blindly and harden the contracts you most refuse to break
- File-first beats package sweeps once the obvious packages are already covered.
- Good architecture-safety targets:
  - plugin resolution and composition
  - normalization contracts
  - parser and serializer behavior
  - structural transforms and merge helpers
  - history, diff, and change-tracking behavior
  - public editor invariants
- `/react` is not permanently excluded. Exclude it only when the current pass explicitly says so.
- React work should wait until non-React boundaries are exhausted only when that is the active phase goal, not because the skill hardcodes it forever.
- Stop when the remaining misses are mostly:
  - thin wrappers
  - DOM-only or provider-only boundaries
  - giant low-ROI sludge files
  - tiny uncovered crumbs
  - code likely to be deleted or rewritten soon

## Cleanup Heuristics

- Score files before cleanup waves instead of skimming randomly.
- Use fresh `lcov` after each pass. Do not keep working from a stale hotspot map.
- Rewrite large hotspot specs before chasing broad title debt. Bigger signal first.
- Scan title debt across:
  - plain string titles
  - `it.each(...)` format strings
  - `String.raw` titles
  - snapshot keys derived from those titles
- Scan for commented-out `it`, `test`, and `describe` blocks during dead-spec cleanup waves.
- End cleanup waves with repo scans for:
  - skipped tests
  - commented-out tests
  - cross-spec imports
  - placeholder titles
  - non-allowlisted Plate React `createEditor` boundaries
- Use `bun run test:profile` for the fast suite when deciding whether a spec belongs in the slow lane. `pnpm test:slowest` and `pnpm check` enforce those thresholds.
- For rule-override hotspots, extract one editor helper and table-drive repeated node-type cases instead of cloning the same transform assertions.
- For plugin-composition hotspots, keep one-owner setup inline. Extract only
  when reuse or an independent contract earns another owner.
- Adapt upstream invariants when local runtime semantics differ. Keep the invariant, rewrite the fixture around the real public contract.
- Treat tiny one-branch crumbs as crumbs. Do not let a coverage number talk you into fake work.
- Penalize scattered ownership and poor test ROI, not file length. A large
  coherent owner is valid.
