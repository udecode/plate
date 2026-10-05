# Executable Corpus Repair

`verify` owns this conditional method. Load it for explicit corpus, harness,
rewrite-closure or repeated regression work. One ordinary bug runs the Bug fix
playbook directly; a contradicted claimed fix follows that playbook's
[failed-fix recovery](../../../playbooks/bug-fix.md) without adopting this
corpus plan or its full schema.

Executable tests own durable regression behavior.
## Conditional Proof References

Read the applicable sections of `verify`'s
[regression oracles](./regression-oracles.md) when
case evidence invokes their domain: runtime/model identity, subscriptions,
render measurement, native input/focus/popup, pointer feedback, caret, geometry
or paint. That reference owns exact assertion tags and domain proof mechanics.
Use `verify`'s command recipes for the chosen runner, and the Bug fix playbook's
[failed-fix recovery](../../../playbooks/bug-fix.md) when a claimed candidate
fails.
## Durable Authority

Use one owner for each fact:

| Fact | Durable owner |
|---|---|
| Behavior that must not regress | Executable test and owning source |
| Issue origin and public status | GitHub issue/PR |
| Integration state | Exact pushed ref, CI, and fresh runtime replay |
| Current multi-step coordination | Active plan |
| Corpus method | `verify` and this reference |

Never create a sidecar TSV, JSON file, database, manifest, or manual case
registry. It duplicates tests and status, drifts, and makes “coverage” mean a
row exists instead of a behavior failing CI.

For dirty local proof, record the tested base ref and issue-owned file
fingerprints in the active plan or handoff. A corpus run is `completed`
when its final local source and every required executable, fresh-host,
stability, review, methodology, and plan gate pass. Commit and push are not
local completion gates. Exact pushed refs, CI, and integration replay own only
the broader integrated, shipped, released, and public-status claims.

## Start Contract

For explicit corpus work, reuse or create one plan from
`.agents/rules/verify/templates/regression.md`. Record:

- target surface or corpus;
- selected executable test cases and source references;
- allowed owners and forbidden scope;
- exact ref or dirty-state boundary;
- route/proof host and freshness method;
- claim width, stability count, and stop rules.

Fill the semantic tables before implementation, then run:

```bash
node .agents/skills/verify/scripts/validate-regression-plan.mjs \
  docs/plans/<plan>.md
```

Before local completion, rerun with `--complete`. `plan-open.mjs` validates
plan closure mechanics; only the corpus semantic validator checks this lane's
oracle, failed-fix, architecture, receipt, and affected-corpus semantics.

The plan is transient execution state. It may contain a compact case table
for the current run, but that table does not survive as another product
behavior database.

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
6. For local completion, prove the final local source bytes on a fresh host and
   record the base ref plus dirty fingerprints when applicable. For integration,
   shipment, release, or public-status claims, use the exact pushed ref and its
   owning CI/runtime evidence.
7. If the real route cannot render without a stub, alias, bypass, or generated
   edit, keep the case blocked or quarantined and repair the proof host.

After product-source edits, every browser proof records
`browser-source-attestation: <fresh host restart or served-input digest>` in
Proof-host readiness before the behavior assertion. Navigating an unexplained
running server, changing browser family against that server, or relying on hot
reload without attesting the served inputs cannot validate current bytes. A
browser family change invalidates the earlier host assumption and repeats this
attestation even when the URL is unchanged.

For a reporter-named route, bind one literal `exact-route:` across the selected
case environment and Proof-host readiness row. The final proof command must
name that route, and at least one receipt input must contain it as an executable
navigation target. A standalone demo, block route, docs wrapper substitute, or
other proxy host cannot certify the reporter route even when it renders the
same component. After a route-based reporter contradiction, the failed-fix
resume state records `exact-route-reproduction: red` or `pass` before another
product attempt.

Generated output is never a convenient source owner. Fix source and run its
generator.

## Atomic Executable Cases

One case is one externally observable setup, action, and outcome. Record only
what another agent needs to run the test:

- stable case ID;
- issue, report, docs, recording, or source references;
- owning package/app and exact route/surface;
- setup, target, action, and expected final state;
- expected-outcome authority as `reporter: <source>`,
  `accepted-product-law: <source>`, `existing-contract: <source>`, or
  `upstream-contract: <source>`;
- red-test escalation as `unit-red: <test>`,
  `e2e-required: <unproved native boundary>`, or both for distinct contracts;
- executable test file and exact command;
- applicable model, DOM/native, pointer-feedback, focus, popup,
  geometry/paint, subscription-lifecycle, runtime-error, and follow-up-input
  fields;
- tested ref or dirty-state boundary;
- required retry-free stability.

The executable test must assert the user-visible invariant and the owning model
invariant when both matter. Test names should make the behavior discoverable;
include an issue ID when it materially improves provenance.

Every observed regression needs a permanent executable test. If no current
runner can express the exact claim, improve the runner/proof host or keep the
case blocked. Do not substitute screenshots, prose, a manual checklist, or a
registry row.

Choose the smallest boundary that can express the exact reported invariant.
Record `unit-red: <test>` for a unit/package reproduction. That RED may catch a
contributing fault while leaving native input, route composition, focus,
selection, or paint unproved. Keep distinct coverage for the unproved boundary;
avoid duplicate assertions of the same contract. Manual Browser verification
is evidence for the observed path, not permanent executable coverage.

Runtime-mode, fixture, mounted-owner and model/view identity requirements are
conditional proof contracts in `verify`'s
[runtime and model oracles](./regression-oracles.md#runtime-and-model-contracts).

## Cumulative Reporter Evidence

Build one temporary evidence inventory in the active plan before writing the
oracle. Read the original report, acceptance criteria, attached recordings or
screenshots, and every later reporter confirmation or contradiction relevant
to the current attempt.

- mark a claim superseded only with the exact source and reason.

For each required statement, record its source reference, interaction phase,
claim, oracle anchors, executable test anchor, and current result. Use phases
`setup`, `during-action`, `after-action`, `after-release`, and `follow-up`.
The inventory is transient coordination, not a durable registry. Executable
tests remain the permanent behavior authority. Route-wide measurement and plain
UI-noun inventories follow the applicable `verify` oracle section.

## Reporter Oracle Matrix

Translate every required inventory row into the active plan before the case's
product implementation. For each case, fill one or more phase-specific rows for
every observation kind in the [regression oracles](./regression-oracles.md)
table.

Mark a row `yes` only with a phase, positive assertion, distinct forbidden
state, executable proof layer, `test: <path>#<title>` anchor, and result. Mark
it `no` only with a phase and an N/A reason in every proof cell.

## Proof Selection

Choose the narrowest executable layer that proves the claim:

- package test for deterministic model, operation, normalization, history,
  schema, serialization, or plugin contracts;
- DOM test for projection/event ownership without a full route;
- Playwright or Browser harness for real-route selection, focus, clipboard,
  input, layout, DnD, paint, and runtime errors;
- exact Chrome when the report names Chrome or depends on native browser state;
- real device command/artifact for raw mobile or IME/device claims;
- distinct layers when model and browser behavior can fail independently;
  preserve the smallest proof for each required boundary without duplication.

Choose from the claim, not a mandatory runner order. A successful unit RED
does not close an untested native boundary. E2E requires a recorded lower-layer
limitation; browser exploration alone does not justify another test.

Viewport emulation is not raw-device proof. Manual exploration may diagnose the
case but cannot replace its repeatable final test.

### Repair One Case

The Bug fix playbook repairs one normalized executable case at a time: case ID and source,
owner/route, setup/action/outcome, violated invariant, exact red test and result,
allowed files, forbidden scope, required proof/stability and expected evidence.
Record root cause, durable owner, changed files, exact red/green commands,
ref/dirty fingerprints, stability, architecture verdict, the review the pstack
block's Review rule requires, and caveat in the existing plan. `Patch delegation`
is the regression template's name for this repair record; the lead fills it
directly.

### Verify And Stabilize

Run the owning tests and required native journey. `unit-red:` closes only its
tested contract; `e2e-required:` records the distinct native boundary. Reuse
existing affected-corpus journeys and avoid duplicate proof.

Once a requested or started package, browser, root, or CI gate fails, add it to
`Gate failure closure` with the failure, classification, repair, and exact final
rerun. Completion requires `pass: <evidence>` from that same gate on the final
bytes. A failure called unrelated is still red; partial progress before it
cannot authorize completion.

When a case first fails during stability after an exact green run, freeze the
product bytes and classify that failure before another implementation attempt.
Add the smallest executable diagnostic that identifies the failing phase and
separates product nondeterminism from interaction, host, or oracle drift. If
the reporter action was replaced by a programmatic shortcut, restore the real
interaction through the shared browser harness or prove the shortcut is
behaviorally equivalent. Repair invalid proof machinery and restart every
affected baseline and stability count.

Warm the attested browser and every local route once before the counted run.
If navigation, unrelated external networking, launcher selection, or browser
shutdown fails before the reporter assertion executes, classify it as a
proof-host failure. Revoke the run, record `repair-now`, repair the host, and
restart the full stability count on unchanged product bytes. Do not increment
the product attempt or trigger architecture escalation for behavior the runner
never exercised.

Apply the selected domain oracles through `verify`, including any bounded
geometry settling and post-capture final-state assertion, before final receipts.

Nothing issue-owned may change after final replay. If commit, rebase,
generation, or push changes any proved bytes or runtime inputs, replay before
carrying the completed status to that new tree.

Generate the final receipt by running the exact proof command through:

The helper executes that command from the repository root. Use repository-relative
or absolute test/config paths, even when invoking the helper from a fixture directory.

```bash
node .agents/skills/verify/scripts/capture-proof-receipt.mjs \
  --case-id <case-id> \
  --attempt <number> \
  --claim completed \
  --input <production-or-test-path> \
  --host "none: <package-only reason>" \
  --retries 0 \
  -- <exact command and arguments>
```

For a managed route, replace `--host` with `--host-pid`, `--base-url`, and
`--browser`. Exact Chrome also requires `--browser-executable`, and the proof
command must use that path. Repeat `--case-id` for one combined corpus command
and `--input` for every production, test, fixture, harness, config, generated, or route-host
input that owns the claim. Paste the emitted Markdown rows into `Proof
receipts`. The helper records the ref, input digest/count, latest input mtime,
exact input paths, host process start, proof timestamps, retries, and a
tamper-evident receipt ID. Completion validation recomputes the digest from
those current paths. The helper refuses a failed command or inputs that change
during proof.

Render-count and profiler-event receipts also include every path declared in
`measurement-owner-inputs:`. That measurement boundary covers event emitters,
routers, filters, aggregators, and the rendered owner; listing only the feature
action or browser test cannot close the claim.

For a managed browser host, the proof command must include the exact literal
`--base-url`, for example through `PLAYWRIGHT_BASE_URL=<url>`. Merely writing a
host label with the intended port while the command uses its default URL is a
host mismatch and cannot produce or validate a receipt.

### Decide

- `keep`: executable red/green proof, fresh final replay, stability, durable
  ownership, and review the pstack block's Review rule requires pass.
- `revert`: remove the attempt and re-prove the prior executable behavior.
- `quarantine`: retain useful proof outside the runtime path without a
  completion claim.
- `defer`: name the owner, missing proof, and revisit trigger.
- `block`: name the missing authority/environment/evidence and why no safe
  move remains.

A kept case is `completed` locally when all applicable proof and plan gates
pass. A run is `completed` when every selected case has a terminal decision,
every required kept case is completed, no required runnable case remains, and
the canonical file-plan gates pass. Commit and push are not local completion
gates.

Deferred, blocked, reverted, and quarantined selected cases do not become goal
success through prose.

## Proof Receipts And Affected Corpus

The receipt proves one command ran against unchanged named inputs. It does not
become a permanent registry. Keep it only in the active plan/handoff.

Before a shared style edit, apply `verify`'s
[shared-style consumer proof](./regression-oracles.md#shared-style-consumers).

Map every changed owner to every selected case whose production, fixture,
harness, config, host, or behavior depends on it. After the last edit to that
owner, rerun those cases together when they share state or could invalidate one
another. Record the owner, affected case IDs, last edit time, combined command,
matching receipt input digest, and passing result under `Affected corpus
replay`.

Before the shared-owner edit, run each already-executable affected case and
record `pass: <evidence>` or `red: <evidence>` as its pre-edit baseline. The repair
cannot start with `pending`, N/A, or an inferred historical result. This keeps a
new cross-invariant failure attributable to the current attempt.

When a run adopts already-applied work previously called `candidate-local`,
`kept`, or `completed`, treat the frozen candidate as the first intake target.
Run its affected corpus before restoring baseline bytes or editing product
source, and retain the adopted claim in the selected case status. A red intake
is a `final-verification` failed fix: invalidate the prior claim, diagnose and
close the proof escape, and only then restart from attempt N+1. Changing the
status to `selected` or `pending` cannot erase the failed-fix interrupt.

A separate green from before the final shared-owner edit is stale. A receipt
whose proof starts before the latest named input edit is invalid. A nonzero
retry count cannot certify stability.

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

Run `validate-regression-plan.mjs --complete` first. A structurally complete
plan with an incomplete reporter oracle is still an open corpus run.

## Mandatory Methodology Delta

Every case ends with one:

1. `repair-now`: update and prove the owning rule, template, command, proof
   host, generator, or test helper.
2. `no-change`: cite why the current method handled the case cleanly.
3. `defer`: name the durable owner, deficiency, evidence, and revisit trigger.

Do not optimize away the authoritative executable test.

## Honest Claims And Stops

Claim only what evidence proves:

- `reproduced`: exact current case is red;
- `candidate-local`: local changes make the exact executable case green;
- `kept`: the repair was accepted after executable proof/review;
- `completed`: final local source, exact executable cases, fresh-host replay,
  stability, review, methodology, and canonical plan gates pass. State the
  local/uncommitted/unpushed scope when applicable;
- `integrated`, `shipped`, `released`, or public issue completion/labels`: only
  the coordinator or release owner may use these with their owning evidence
  and authority.

A fresh reporter contradiction invalidates every narrower green/completion
claim and receipt immediately. Never leave `completed` or a public completed
label authoritative while treating the contradiction as a separate optional
follow-up.

Do not freeze one run's cases, refs, blockers, metrics, or conclusions into
reusable methodology.
