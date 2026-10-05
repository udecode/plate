# Testing audit

Review the repo test suite from current reality, not stale vibes.

Use this when you want a periodic testing audit, a fresh coverage map, or a new next-batch recommendation before a breaking-change wave.

## Goal

- rerun fresh repo coverage
- inspect test-suite health
- stop fake work before it starts

## Core Rules

- Use fresh `lcov` as source of truth.
- Do not permanently exclude `/react`. Only exclude it when the current review explicitly says so.
- Penalize wrappers, crumbs, giant sludge files, and likely-dead code.
- Reward deterministic transforms, queries, merge helpers, parser/serializer boundaries, plugin resolution, normalization, and public editor contracts.
- Coverage is regression telemetry, not a KPI.
- Rank a file by the named, plausible defect a test there would catch, per the Tests rule in `AGENTS.md`. A file with no nameable defect, or whose defect a type, lint rule, static check or existing test already catches, scores zero whatever its coverage.
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

### 3. Rank Files

Rank the remaining `packages/**/src/**` files by the Core Rules' named-defect test.

Exclude by default:

- test files
- barrels
- declaration files
- obvious type-only files
- generated junk
- zero-value crumbs

Scoring should reflect:

- the named defect a test would catch
- boundary type
- runtime coverage
- uncovered behavior
- likely regression value during breaking changes
- test ROI

### 4. Final Recommendation

Answer with:

- what the real next batch is
- whether to keep pushing coverage or stop
- what should be deferred by design

## Stop Conditions

Recommend stopping when the remaining misses are mostly:

- wrappers
- provider/store dust
- DOM-only boundaries
- giant low-ROI files
- tiny uncovered crumbs
- code likely to be rewritten soon

At that point, tell the user to switch from coverage work to architecture-safety work.

- Architecture-safety pass: stop following coverage blindly and harden the contracts you most refuse to break.
- Good architecture-safety targets:
  - plugin resolution and composition
  - normalization contracts
  - parser and serializer behavior
  - structural transforms and merge helpers
  - history, diff, and change-tracking behavior
  - public editor invariants
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
