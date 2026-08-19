# Regression Methodology

Load this reference whenever the `regression` skill runs.

## Contents

- [Outcome](#outcome)
- [Durable Authority](#durable-authority)
- [Start Contract](#start-contract)
- [Current Source And Proof-Host Readiness](#current-source-and-proof-host-readiness)
- [Atomic Executable Cases](#atomic-executable-cases)
- [Proof Selection](#proof-selection)
- [Probe Before Scale](#probe-before-scale)
- [Packet Lifecycle](#packet-lifecycle)
- [Corpus Work Without A Registry](#corpus-work-without-a-registry)
- [Master And Durable Children](#master-and-durable-children)
- [Canonical Autogoal Gates](#canonical-autogoal-gates)
- [Mandatory Methodology Delta](#mandatory-methodology-delta)
- [Honest Claims And Stops](#honest-claims-and-stops)

Regression is the durable supervisor. `patch` is the only one-case
implementation worker. Executable tests are the permanent behavior record.

## Outcome

```txt
current source and proof host ready
-> atomic executable case
-> smallest high-value probe
-> exact reproduction and classification
-> failing test on the violated invariant
-> one-case patch delegation
-> focused green proof
-> fresh-host stability
-> keep, revert, or quarantine
-> methodology delta
-> next executable case or honest stop
```

No stage may borrow confidence from a later stage. A baseline is evidence, not
law. A green proxy does not prove the named route. A clean review does not prove
behavior. A plan table is coordination, not regression coverage.

## Durable Authority

Use one owner for each fact:

| Fact | Durable owner |
|---|---|
| Behavior that must not regress | Executable test and owning source |
| Issue origin and public status | GitHub issue/PR |
| Integration state | Exact pushed ref, CI, and fresh runtime replay |
| Current multi-step coordination | Active Autogoal plan |
| Methodology | Regression source rule and this reference |

Never create a sidecar TSV, JSON file, database, manifest, or manual case
registry. It duplicates tests and status, drifts, and makes “coverage” mean a
row exists instead of a behavior failing CI.

For dirty local proof, record the tested base ref and issue-owned file
fingerprints in the active plan or handoff. For fixed/completed claims, prefer a
clean checkout at the exact pushed ref; the commit identifies the complete
tree.

## Start Contract

For non-trivial work, create or continue one Autogoal with
`docs/plans/templates/regression.md`. Record:

- target bug, surface, or corpus;
- selected executable test cases and source references;
- allowed owners and forbidden scope;
- exact ref or dirty-state boundary;
- route/proof host and freshness method;
- claim width, stability count, and stop rules.

The goal plan is transient execution state. It may contain a compact case table
for the current run, but that table does not survive as another product
behavior database.

One ordinary bug should route directly to `patch`. Regression is for repeated
loops, corpora, harness work, or explicit self-improving methodology.

## Current Source And Proof-Host Readiness

Before a behavior claim:

1. Resolve the live source owner and current checkout ref.
2. Resolve the real executable test and runner from current source.
3. For route claims, identify the source-built host, route, process, port, and
   package export path.
4. Restart or rebuild when source, exports, fixtures, generated inputs, or host
   configuration changed. Never trust an unexplained existing server.
5. For dirty proof, capture fingerprints for every issue-owned production,
   fixture, test, harness, and host-input file in the plan or handoff.
6. For fixed/completed proof, use a clean checkout at the final pushed ref with
   zero issue-owned differences.
7. If the real route cannot render without a stub, alias, bypass, or generated
   edit, keep the case blocked or quarantined and repair the proof host.

Generated output is never a convenient source owner. Fix source and run its
generator.

## Atomic Executable Cases

One case is one externally observable setup, action, and outcome. Record only
what another agent needs to run the test:

- stable case ID;
- issue, report, docs, recording, or source references;
- owning package/app and exact route/surface;
- setup, target, action, and expected final state;
- executable test file and exact command;
- applicable model, DOM/native, focus, popup, geometry/paint, runtime-error,
  and follow-up-input fields;
- tested ref or dirty-state boundary;
- required retry-free stability.

The executable test must assert the user-visible invariant and the owning model
invariant when both matter. Test names should make the behavior discoverable;
include an issue ID when it materially improves provenance.

Every observed regression needs a permanent executable test. If no current
runner can express the exact claim, improve the runner/proof host or keep the
case blocked. Do not substitute screenshots, prose, a manual checklist, or a
registry row.

Treat prior behavior, older releases, upstream Slate, and recordings as
evidence. Current accepted product/editor law decides the oracle.

## Proof Selection

Choose the narrowest executable layer that proves the claim:

- package test for deterministic model, operation, normalization, history,
  schema, serialization, or plugin contracts;
- DOM test for projection/event ownership without a full route;
- Playwright or Browser harness for real-route selection, focus, clipboard,
  input, layout, DnD, paint, and runtime errors;
- exact Chrome when the report names Chrome or depends on native browser state;
- real device command/artifact for raw mobile or IME/device claims;
- multiple layers when model and browser behavior can disagree.

Viewport emulation is not raw-device proof. Manual exploration may diagnose the
case but cannot replace its repeatable final test.

## Probe Before Scale

Run the smallest probe that can falsify the highest-value assumption:

- one exact test;
- one exact route readiness check;
- one gesture plus final-state assertion;
- one current-source import/export check.

If the probe exposes a wrong command, stale server, missing export, generated
drift, or broken host, repair that owner before adding cases.

## Packet Lifecycle

### Reproduce

Replay the exact setup, action, expected state, browser/device scope, and
follow-up input. Capture applicable model, DOM/native, focus, popup,
geometry/paint, and runtime errors.

If the exact case does not fail, record `needs-repro` in the active plan. A
nearby route, direct model call, or synthetic proxy is not the same case.

### Classify

Name the violated invariant and durable owner before patching. Route public API
shape to `best-api`; broader Plite/Plate architecture goes through its layer
plan.

### Add Red Proof

Add or expose an executable failing test before the fix whenever practical.
The red and green commands must cover the same case and claim fields. If a
destructive external state prevents a safe red run, record the exact limitation
and improve the repeatable proof path before claiming fixed.

### Delegate One Case To Patch

Send one packet:

- case ID and source references;
- owner, route/surface, setup, action, and expected outcome;
- violated invariant and classification;
- executable test path and exact red result;
- allowed edit boundary and forbidden scope;
- required proof layers and stability count;
- expected return evidence.

Patch returns root cause, durable owner, changed files, exact red/green
commands, tested ref or dirty fingerprints, stability, architecture-pressure
verdict, review result, and residual caveat.

### Verify And Stabilize

Run the owning test first. Then replay the exact case on a fresh host whenever
the route/runtime owner changed.

Use repeated retry-free warm runs for flaky, native, lifecycle, compositor,
focus, selection, DnD, or device risks. Default to five. One failure keeps the
case open.

Nothing issue-owned may change after final replay. Commit, rebase, generation,
or push invalidates dirty proof; replay on the final ref.

### Decide

- `keep`: executable red/green proof, fresh final replay, stability, durable
  ownership, and review pass.
- `revert`: remove the attempt and re-prove the prior executable behavior.
- `quarantine`: retain useful proof outside the runtime path without a
  completion claim.
- `defer`: name the owner, missing proof, and revisit trigger.
- `block`: name the missing authority/environment/evidence and why no safe
  move remains.

Deferred, blocked, reverted, and quarantined selected cases do not become goal
success through prose.

## Corpus Work Without A Registry

Discover the current corpus from executable sources each run:

- runner test discovery/list output;
- scoped test filenames and test titles;
- live issues that do not yet have an executable case;
- current source owners and changed paths.

If the run needs ordering, keep a compact temporary plan table:

| Case | Test file/command | Status | Tested ref | Next owner |
|---|---|---|---|---|

Do not persist this table as a second registry. Once a case earns permanent
coverage, the test is the record. Live issues without tests remain issues until
selected; they do not need a duplicate row elsewhere.

## Master And Durable Children

When orchestrator mode is active, the master owns the plan, selection, and
final decision. A durable child owns one bounded case or read-only proof packet.

- Never run parallel writers against the same source, tests, plan, build,
  generated output, or managed host.
- Serialize cases sharing production files, fixtures, package builds, or route
  hosts.
- Parallelize read-only audits only when artifacts and hosts are disjoint.
- Reuse the same child for same-case follow-ups.

## Canonical Autogoal Gates

The runtime plan must use these headings:

- `Start Gates:`
- `Work Checklist:`
- `Completion Gates:`
- `Phase / pass table:`
- `Verification evidence:`
- `Reboot status:`
- `Open risks:`

Required runtime rows live in `Work Checklist` or `Completion Gates`.
Supporting case tables cannot close the plan. Run `check-complete.mjs` only
after every selected executable case passes its required red/green, fresh-host,
stability, review, and methodology-delta gates.

## Mandatory Methodology Delta

Every case ends with one:

1. `repair-now`: update and prove the owning rule, template, command, proof
   host, generator, or test helper.
2. `no-change`: cite why the current method handled the case cleanly.
3. `defer`: name the durable owner, deficiency, evidence, and revisit trigger.

Repair immediately when a case exposes wrong routing, irrelevant skill loading,
bad commands, stale servers, generated drift, missing proof layers,
false-green gates, noisy output, redundant broad checks, or shared-host
conflicts.

Do not optimize away the authoritative executable test.

## Honest Claims And Stops

Claim only what evidence proves:

- `reproduced`: exact current case is red;
- `candidate-local`: local changes make the exact executable case green;
- `verified-local`: final local source and stability gates pass;
- `kept`: Regression accepted the local patch after executable proof/review;
- `fixed`, `shipped`, or `completed`: only the coordinator/release owner
  may use these after final pushed/integration/release evidence.

Stop a case when kept, reverted, quarantined, deferred with owner, or blocked
with no safe move. Complete the goal only when every selected executable case
passes, no required runnable case remains, methodology deltas resolve,
canonical Autogoal gates pass, and the requested time/batch policy is
satisfied.

Do not freeze one run's cases, refs, blockers, metrics, or conclusions into
reusable methodology.
