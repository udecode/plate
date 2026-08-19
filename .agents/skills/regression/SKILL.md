---
description: Test-first Plate/Plite regression methodology for exact reproduction, executable coverage, one-case Patch delegation, fresh-host verification, stability, corpus replay, and automatic workflow improvement.
argument-hint: '[repair <expectation> | <bug|surface|corpus>] [full-loop | timed 1h|2h|overnight | batch-loop]'
disable-model-invocation: true
name: regression
metadata:
  skiller:
    source: .agents/rules/regression.mdc
---

# Regression

Handle $ARGUMENTS.

Read [methodology.md](./references/methodology.md) completely before creating a
goal, test, or child task.

Regression owns a self-improving test-first loop:

```txt
source and proof host ready -> atomic case -> smallest falsifying probe
-> exact reproduction -> failing executable test -> one-case patch
-> focused green -> fresh-host stability -> keep/revert/quarantine
-> methodology delta -> next executable case or honest stop
```

`auto regression ...` routes here. Auto does not retain a second regression
method. `patch` remains the only one-case implementation worker.

## Use When

- The user invokes `regression` or `auto regression`.
- The user asks for a regression harness, rewrite closure, corpus replay,
  example/story coverage, or a repeatable reproduce-test-fix-verify loop.
- Several bugs or behaviors need one resumable test-first execution plan.
- A report may expose a runtime bug, missing oracle, broken proof host, stale
  generated input, bad command, or weak methodology.
- The workflow must improve itself after each case instead of preserving a
  frozen checklist.

## Do Not Use When

- One ordinary local behavior bug needs a direct repair: use `patch`.
- Public issue/PR/security queue state is the target: use `maintainer` or the
  public coordinator.
- Work is already applied and needs until-clean closure: use `autoclosure`.
- Public API or runtime architecture is unresolved: use `best-api`,
  `plite-plan`, or `plate-plan` before implementation.
- Broad non-regression quality/perf/docs supervision is requested: use `auto`.

## Authority

- Executable tests own durable regression behavior.
- GitHub issues and source references own provenance and public status.
- Exact refs, clean hosts, and CI/runtime receipts own integration claims.
- Regression owns case selection, current-source readiness, proof width,
  serialization of Patch work, stability, packet decisions, claim width, and
  methodology deltas.
- The goal plan is transient coordination for non-trivial runs. It is not a
  second behavior database.
- Patch owns exactly one normalized local repair at a time.
- Package/runtime owners remain authoritative for implementation.
- Current checkout source outranks old plans, baselines, recordings, generated
  output, and prior results.
- No public mutation, commit, push, PR, release, or generated-output edit is
  authorized unless the user separately asks.

## Hard-Cut State Rule

Never create or maintain a sidecar TSV, JSON, database, manifest, or manual
case registry for Regression.

- One fixed regression must have an executable test that fails on the violated
  invariant and passes after the fix.
- A corpus is discovered from executable tests, current source, and live issue
  provenance. If coordination is needed, keep a compact temporary case table
  in the active goal plan with case ID, test path, status, tested ref, and next
  owner.
- Do not copy test assertions, source fingerprints, issue status, or proof
  output into another permanent store.
- If the exact behavior cannot be expressed by a repeatable test or proof
  command, improve the proof host or keep the claim blocked. A manual registry
  is not substitute evidence.

## Goal And Durable State

Use Autogoal for non-trivial runs with
`docs/plans/templates/regression.md`:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template regression \
  --title "<surface or corpus> regression"
```

Every required runtime condition belongs in canonical `Work Checklist` or
`Completion Gates` rows. Supporting case tables coordinate work only and
never replace tests or completion gates.

## Workflow

### 1. Ground Current Truth

Resolve the live source owner, exact ref or dirty-state boundary, executable
test entrypoint, route/proof host, package export/build path, generated/source
boundary, and freshness method. Prove the host observes current source before
testing behavior.

Repair command shape, stale server, missing export, generated drift, or host
readiness before scaling cases.

### 2. Define Atomic Executable Cases

One case is one observable setup, action, and outcome. Record in the active
plan or Patch packet:

- stable case ID and source issue/reference;
- owner, route/surface, setup, action, and expected outcome;
- executable test path and exact command;
- applicable model, DOM/native, focus, popup, geometry/paint, runtime-error,
  and follow-up-input fields;
- tested ref, dirty-state boundary when applicable, and required stability.

Every observed regression needs permanent executable coverage at the layer
that can prove the claim. Prefer an existing test file and runner over a new
harness.

### 3. Probe Before Scale

Run the smallest test or route action that can falsify the highest-value
assumption. When the runner, source path, or host is wrong, repair it before
adding cases.

### 4. Reproduce And Delegate

Replay the exact case. A proxy remains labeled proxy. If the case is red,
delegate one normalized packet to `patch` with the violated invariant,
owner, exact red evidence, edit boundary, forbidden scope, proof layers,
stability count, and expected return fields.

Do not run concurrent writers on the same owner, plan, build output, test
fixture, or route host.

### 5. Verify And Decide

Read back Patch evidence. Run the owning executable test first, then the exact
fresh-host case and only the breadth required by the claim.

Use retry-free warm repetitions for native input, lifecycle, selection, focus,
DnD, compositor, flaky, or device risks. Default to five when those risks
apply. One failure keeps the case open.

Decide:

- `keep`: executable red/green proof, fresh final replay, stability, durable
  owner, and review all pass;
- `revert`: remove the attempt and re-prove the prior executable behavior;
- `quarantine`: keep useful proof outside the runtime path without claiming
  completion;
- `defer` or `block`: name the missing owner/evidence and revisit trigger.

### 6. Improve The Method

Every case records one methodology decision in the plan:

- `repair-now`: patch and prove the durable rule, template, command, proof
  host, generator, or test helper;
- `no-change`: cite why the current method handled the case cleanly;
- `defer`: name the owner, deficiency, evidence, and trigger.

Repair avoidable command mistakes, irrelevant skill loading, stale servers,
generated drift, false-green gates, noisy output, and repeated setup in the
same run when safe. After agent-source changes, run focused proof,
`pnpm install`, mirror parity, and agent-native review.

## Orchestration

When orchestrator mode is active, the master owns the plan, selection, and
final decisions. Use one durable child for one bounded case or read-only proof
packet. Reuse it for same-case follow-ups. Never run parallel writers against
overlapping source, tests, plans, builds, generated output, or managed hosts.

## Repair Command

For `repair <expectation>`, repair this workflow rather than product runtime:

1. State the recurring miss and future failure it permits.
2. Edit `.agents/rules/regression.mdc`, its methodology reference, template,
   proof host, generator, or routing owner.
3. Delete obsolete workflow surface instead of deprecating it.
4. Add or strengthen executable tests when the miss is mechanical.
5. Run focused proof, `pnpm install`, source/mirror parity,
   `agent-native-reviewer`, and P2 review when executable workflow code
   changed.

## Verification

Minimum workflow proof:

```bash
node --test \
  .agents/rules/regression/scripts/test-first-contract.test.mjs \
  .agents/skills/regression/scripts/test-first-contract.test.mjs
node .agents/rules/plate-next/scripts/sync-resources.mjs --check
```

Also source-audit removed tooling/data paths and stale doctrine, prove an
unfinished Regression plan fails `check-complete.mjs`, and prove a completed
plan can close from executable test evidence without inventing another
registry.

Run package, DOM, Playwright, Browser, Chrome, or device proof according to the
claim. End non-trivial implementation packets with P2 autoreview.

## Final Handoff

Report:

- plan path and selected executable test cases;
- exact reproduction, fix, test commands, hosts, refs, and stability;
- keep/revert/quarantine/defer/block decisions;
- methodology delta for every case;
- source/generated sync and review status;
- residual claim limits and next owner.

Never call a run fixed, shipped, completed, or clean beyond its actual pushed,
integration, release, and review evidence.
