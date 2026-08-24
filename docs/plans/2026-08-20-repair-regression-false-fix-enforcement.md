# repair regression false fix enforcement

Objective:
Repair Regression false-fix enforcement so incomplete reporter oracles cannot
close and every failed fix automatically repairs Regression before another
product attempt.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-20-repair-regression-false-fix-enforcement.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- agent-native

Regression source:
- target bug / surface / corpus: Regression's false-green workflow exposed by
  Plate issues #5091, #5065, #5088, and #5064
- lane and current source owner: `.agents/rules/regression.mdc`, its methodology
  reference, `docs/plans/templates/regression.md`, and Regression scripts/tests
- selected executable test cases: the four historical false-completion plans
  must fail semantic validation; an evidence-complete fixture must pass; a
  failed-fix fixture must require automatic methodology repair; generated
  source/mirror parity must pass
- tested ref or dirty-state boundary: current checkout HEAD plus exact hashes
  of changed Regression source, template, scripts, tests, and generated mirrors
- route / proof host and freshness method: Node workflow tests on current source;
  no product route or browser behavior claim belongs to this repair
- invocation mode / timebox: one-shot skill repair with no timebox

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- Regression source and template require a reporter-oracle matrix with positive
  and forbidden end states across every applicable observation layer.
- A reporter contradiction or failed claimed fix invalidates prior green,
  completion, proof receipts, and public-status authority.
- Every failed fix automatically enters `regression repair` before another
  product patch; the repair changes and proves the workflow, not just prose.
- A second failed fix requires Best API plus the owning Plite/Plate plan before
  another implementation attempt.
- Final proof records machine-verifiable source/host identity and reruns the
  affected exact corpus after the last shared-owner edit.
- The semantic validator rejects all four old false-completion plans, rejects a
  failed-fix plan without method repair, and accepts one complete fixture.
- `pnpm install` regenerates mirrors; source/generated parity and focused tests
  pass without lint or Autoreview.
- All canonical Work Checklist and Completion Gates rows resolve and
  both Regression semantic validation and `check-complete.mjs` pass.

Verification surface:
- focused validator and workflow contract tests from source and generated skill
- negative validation of the four historical false-completion plans
- negative failed-fix fixture and positive evidence-complete fixture
- `pnpm install`, source/generated parity, and sync-resource check
- source audit for automatic failed-fix repair, contradiction invalidation,
  architecture escalation, exact Chrome, proof receipt, and affected-corpus rules
- agent-native review; no lint and no Autoreview
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-repair-regression-false-fix-enforcement.md`

Constraints:
- Executable tests own durable regression behavior.
- GitHub owns issue provenance/status; exact refs and runtime/CI receipts own
  integration claims.
- Regression owns selection, proof width, stability, packet decision, claim
  width, and methodology delta.
- Patch owns one normalized local repair at a time.
- The goal plan is transient coordination, not a second behavior database.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source, tests, plans, generated output, builds,
  or route hosts.
- Generated output is not a source owner.
- Mark fully proved local work `completed` and record its local ref/dirty
  fingerprints plus uncommitted/unpushed state when true. Do not widen that
  status into integrated, shipped, released, or public issue completion without
  the owning evidence and authority.
- Do not edit generated `.agents/skills/regression/**` files directly.
- Do not create a permanent behavior registry; semantic validation reads the
  transient active plan and executable test/source paths.
- Do not make expected TDD red or first reproduction count as a failed fix. A
  failed fix means a candidate/kept/completed claim later fails exact replay,
  final verification, or reporter confirmation.
- Do not run lint or Autoreview in this session.

Boundaries:
- allowed source owners: Regression rule, methodology, project template, and
  focused source-owned scripts/tests; smallest routing text only if required
- allowed proof/test owners: Regression workflow validators/contracts and
  historical plans as negative fixtures
- generated/source boundary: `.agents/rules/regression/**` and
  `docs/plans/templates/regression.md` are editable sources;
  `.agents/skills/regression/**` is regenerated by `pnpm install`
- browser/device claim width: N/A; this repair changes agent workflow only
- forbidden product/API/release/public mutations: all product packages, public
  APIs, GitHub comments/labels/issues, commits, pushes, PRs, releases, and lint
- orchestration mode and writer ownership: one local writer; no subagents

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: final goal-plan check
- current executable case: false-fix semantic validator and automatic repair
- current case status: completed
- next owner: user review or commit/push when requested
- goal status: active

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Skill repair, automatic repair after failed fix, source sync, mechanical proof, no lint, and no Autoreview are recorded above. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely before edits. |
| Active goal checked or created | yes | Goal created with this exact plan path. |
| Current source owner and tested ref recorded | yes | Source owners and current-checkout fingerprint policy recorded above. |
| Executable test cases discovered | yes | Four historical negative plans, one failed-fix fixture, one complete fixture, and mirror parity selected. |
| Route/proof-host readiness plan recorded | yes | Node workflow tests use current source; product browser proof is N/A. |
| Patch delegation boundary recorded | no | This is workflow implementation, not a product Patch packet. |
| Orchestrator writer ownership recorded | no | Single local writer; no subagents. |
| Output budget strategy recorded | yes | Exact Regression files and bounded script/test output only. |
| Claim width and blocked rules recorded | yes | Workflow repair only; no product or public status claim. |
| Agent-native pack selected | yes | Materialized agent-native rows are present and the pack is recorded. |
| Agent-facing action surface identified | yes | Regression entrypoint, methodology, template, validator, and generated mirror. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/**` source and `.agents/skills/**` generated boundary recorded. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Reviewer will be loaded before its dedicated review gate; Autoreview remains excluded. |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, executable test path/command, tested ref, and
      required stability.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch; N/A
      because this packet repairs Regression itself and changes no product bug.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat; N/A for the same workflow-only reason.
- [x] Focused green proof and exact final fresh-host replay passed.
- [x] Required retry-free stability runs passed with no retry.
- [x] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [x] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [x] Every case records one methodology delta.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [x] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Reporter-oracle validation requires one positive and one forbidden-state
      assertion for every applicable observation layer.
- [x] Failed claimed fixes and reporter contradictions invalidate prior proof
      and trigger automatic Regression repair before another product patch.
- [x] A second failed fix triggers Best API and owning Plite/Plate planning.
- [x] Final-source proof requires a machine-checkable receipt and affected-corpus
      replay after the last shared-owner edit.
- [x] The four historical false-fix plans fail semantic validation.
- [x] A failed-fix fixture without workflow repair fails; the same fixture with
      a proved repair passes.
- [x] One evidence-complete fixture passes semantic validation.
- [x] No lint or Autoreview command runs.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: one selected case is completed with `repair-now` |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: dirty ref and 20-input digest recorded |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: deterministic Node runner reads exact current input paths |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: initial missing-validator red; final source/generated corpus 42/42 |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: one complete semantic fixture was the first probe |
| Patch delegation closure | no | Read back one-case root-cause/red/green/proof evidence | N/A: workflow owner repaired itself; no product Patch packet |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: attempt-2 receipt `sha256:d6c70993126d2d00a349242d52b15fc87c1f4b1123f9dff396db3d9ab95ddcca` |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: deterministic final corpus, zero retries |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: workflow repair kept and completed |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: completed locally at dirty ref; uncommitted and unpushed |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: plan plus executable source tests only |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: `pnpm install`, parity contracts, and sync-resource check |
| Orchestrator writer closure | no | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: one local writer and no route host |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: bounded output and exact input receipts |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: `repair-now` implemented and tested |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pass: Skiller regenerated mirrors; source/generated contracts pass |
| Agent-native review | yes | Run for changed agent workflows or record N/A | pass after fixing receipt input-path opacity |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: final handoff below |
| Autoreview | no | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: user explicitly stopped Autoreview for this session |
| Reporter oracle closure | yes | Prove positive and forbidden states at every applicable layer | pass: model/runtime assertions plus explicit N/A reasons |
| Failed-fix interrupt closure | yes | Prove automatic Regression repair and second-failure escalation | pass: source/generated contract and semantic fixtures |
| Proof receipt closure | yes | Recompute final input digest and replay affected corpus | pass: 20-input attempt-2 receipt and affected-corpus row below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-repair-regression-false-fix-enforcement.md` | pass: final self-consistent plan submitted to the checker |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pass: generated skill and script mirrors exact |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | pass: root routing, Patch bridge, Regression interrupt, template, and helper |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pass: capability map complete; one P1 fixed; no open P1 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | User requirements, skill boundaries, goal, and proof threshold recorded. | source/host readiness |
| Current source and proof-host readiness | completed | Rule, methodology, template, contract test, mirror-sync owner, and historical plans resolved. | executable cases |
| Executable case discovery and selection | completed | Four old plans, complete/failed-fix/browser/receipt fixtures, and mirror corpus selected. | smallest probe |
| Smallest high-value probe | completed | Initial semantic fixture failed because the validator module did not exist. | reproduce/classify |
| Reproduce, classify, and red test | completed | Root cause: structural prose checks could not validate reporter or proof semantics. | workflow implementation |
| One-case Patch delegation | completed | N/A: this case repairs Regression's own workflow, not a product owner. | verification |
| Focused verification and stability | completed | Final 42-test source/generated corpus passed with zero retries. | packet decision |
| Keep/revert/quarantine | completed | Kept and completed locally. | methodology delta |
| Methodology repair/no-change/defer | completed | `repair-now` implemented in durable source and workflow tests. | reviews |
| Reviews and final handoff | completed | Agent-native review passed after one P1 receipt fix; Autoreview excluded by user. | goal-plan check |
| Final goal-plan check | completed | Source/generated semantic complete validation passed; final self-consistent plan submitted to Autogoal. | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| regression-false-fix-enforcement | Felix contradictions on Plate #5091, #5065, #5088, and #5064 plus the completed audit plan | validate historical plans, failed-fix fixtures, browser-environment pressure, receipts, and complete fixture | incomplete reporter oracles cannot complete; failed claimed fixes cannot retry before workflow repair | N/A: deterministic Node workflow | `.agents/rules/regression/scripts/validate-regression-plan.test.mjs`; `node --test .agents/rules/regression/scripts/validate-regression-plan.test.mjs` | completed | dirty:1fb72c581095f23ddba3f597f41e8b10608283ef | user review or commit/push when requested |

Reporter oracle matrix:
| Case ID | Observation | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|---------|--------------------|-----------------|-------------|-------------------|--------|
| regression-false-fix-enforcement | model | yes | complete fixtures pass and incomplete/failed-fix fixtures fail with exact reasons | a polished old plan or failed-fix retry satisfies semantic closure | package | test: .agents/rules/regression/scripts/validate-regression-plan.test.mjs#complete fixture satisfies semantic closure | pass: source/generated workflow corpus 42/42 |
| regression-false-fix-enforcement | dom-native | no | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair |
| regression-false-fix-enforcement | focus | no | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair |
| regression-false-fix-enforcement | popup | no | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair |
| regression-false-fix-enforcement | geometry-paint | no | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair |
| regression-false-fix-enforcement | runtime-errors | yes | proof helper exits zero and emits a valid tamper-evident receipt | failed commands, changing inputs, or generator/validator ordering drift emits an accepted completion receipt | package | test: .agents/rules/regression/scripts/validate-regression-plan.test.mjs#capture and validation share canonical mixed-path input ordering | pass: success, failure, changing-input, and mixed-order helper tests in 42/42 corpus |
| regression-false-fix-enforcement | follow-up-input | no | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair | N/A: workflow-only repair |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| regression-false-fix-enforcement | 2 | completed | "node" "--test" "--test-reporter=dot" ".agents/rules/regression/scripts/test-first-contract.test.mjs" ".agents/rules/regression/scripts/validate-regression-plan.test.mjs" ".agents/skills/regression/scripts/test-first-contract.test.mjs" ".agents/skills/regression/scripts/validate-regression-plan.test.mjs" | pass: exit 0 in 516ms | dirty:1fb72c581095f23ddba3f597f41e8b10608283ef | sha256:74bd3a2df71ab7bfe7423fb958a821464c68760bba40376dd127e9c978988a41 | 20 | .agents/AGENTS.md,.agents/rules/patch.mdc,.agents/rules/plate-next/scripts/sync-resources.mjs,.agents/rules/regression.mdc,.agents/rules/regression/references/methodology.md,.agents/rules/regression/scripts/capture-proof-receipt.mjs,.agents/rules/regression/scripts/proof-receipt-contract.mjs,.agents/rules/regression/scripts/test-first-contract.test.mjs,.agents/rules/regression/scripts/validate-regression-plan.mjs,.agents/rules/regression/scripts/validate-regression-plan.test.mjs,.agents/skills/patch/SKILL.md,.agents/skills/regression/SKILL.md,.agents/skills/regression/references/methodology.md,.agents/skills/regression/scripts/capture-proof-receipt.mjs,.agents/skills/regression/scripts/proof-receipt-contract.mjs,.agents/skills/regression/scripts/test-first-contract.test.mjs,.agents/skills/regression/scripts/validate-regression-plan.mjs,.agents/skills/regression/scripts/validate-regression-plan.test.mjs,AGENTS.md,docs/plans/templates/regression.md | host:none - deterministic Node workflow | 2026-08-20T10:12:25.935Z | 2026-08-20T10:12:54.802Z | 2026-08-20T10:12:55.318Z | 0 | sha256:d6c70993126d2d00a349242d52b15fc87c1f4b1123f9dff396db3d9ab95ddcca |

Affected corpus replay:
| Owner | Affected cases | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-----------------|------------------|----------------------|--------|
| Regression workflow source and generated mirror | regression-false-fix-enforcement | 2026-08-20T10:12:25.935Z | `node --test --test-reporter=dot` over source/generated contract and semantic tests | sha256:74bd3a2df71ab7bfe7423fb958a821464c68760bba40376dd127e9c978988a41 | pass: 42/42 after final owner edit |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| regression-false-fix-enforcement | 1 | completed receipt failed final semantic validation because generator and validator sorted mixed paths differently | final-verification | yes: attempt-1 receipt, green, and completion claim revoked | repair-now: `.agents/rules/regression/scripts/proof-receipt-contract.mjs` centralizes digest and receipt identity | pass: mixed root-and-dot input receipt validates end to end in source and generated corpus | no: first failure had a local duplicated-canonicalization owner | N/A: no public API or product layer architecture pressure | reproduced: exact mixed-path receipt mismatch became an executable test before attempt 2 |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| regression-false-fix-enforcement | 1 | none: first failure exposed duplicated receipt canonicalization with one durable workflow owner | patch | N/A: no product API decision | N/A: no product runtime adoption | pass: shared proof-receipt contract removes generator/validator drift |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| regression-false-fix-enforcement | `.agents/rules/regression/**`, `.agents/rules/patch.mdc`, `.agents/AGENTS.md`, template, and generated mirrors | Node test runner on exact current files; no browser host applies | attempt-2 receipt records dirty ref, exact 20 paths, SHA-256 digest, timestamps, and zero retries | source under `.agents/rules/**`; generated under `.agents/skills/**` via `pnpm install` | pass |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| regression-false-fix-enforcement | initial semantic test failed because validator module was absent | N/A: Regression workflow source only; no product Patch delegation | final source/generated corpus plus semantic complete check; deterministic single run | N/A: workflow owner implemented its own validator and tests | pass: delegation intentionally N/A |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| regression-false-fix-enforcement | final source/generated Node corpus | 1 deterministic final run after failed-fix repair | pass: 42/42 | 0 | kept and completed locally on attempt 2 |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| regression-false-fix-enforcement | 42 source/generated workflow tests, 20-input attempt-2 receipt, four historical negative plans | kept and completed | local dirty checkout only; uncommitted and unpushed | semantic validator cannot replace the behavior assertions it checks for | user review or commit/push when requested |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| regression-false-fix-enforcement | structural prose checks accepted four reporter-invalidated plans; attempt-1 duplicated receipt canonicalization | repair-now | `.agents/rules/regression.mdc` plus methodology/template, shared proof-receipt contract, validator/helper, tests, Patch bridge, and root routing rule | pass: old-plan rejection, failed-fix, architecture, exact-Chrome, mixed-path receipt, and complete-fixture contracts | automatic repair ran on its own first failed completion claim and attempt 2 passed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| final receipt output | proof helper | first projection exceeded the conversation output budget | child test output was inherited before the receipt row | high | piped the same retry-free command through `tail -n 1`; receipt captured without changing proof semantics |
| attempt-1 complete semantic validation | Regression receipt contract | failed immediately | generator used locale collation while validator used code-unit ordering | critical | invalidated attempt 1, centralized canonicalization, added mixed-path end-to-end test, and restarted from reproduction |
| generic Skill Creator quick validator | global helper | one failed compatibility check | helper rejects repo-supported `argument-hint` and `disable-model-invocation` frontmatter | low | rejected as incompatible; repo Skiller generation, source/mirror parity, and workflow tests are authoritative |

Findings:
- The current contract tests assert prose fragments and source/mirror equality;
  they do not validate a Regression plan's oracle or proof semantics.
- `check-complete.mjs` is intentionally structural and accepted all four
  reporter-invalidated old plans, so Regression needs its own semantic checker.
- Regression resources are copied explicitly by
  `.agents/rules/plate-next/scripts/sync-resources.mjs`; new scripts/tests must be
  added to that source-owned pair list before `pnpm install`.
- Agent-native review requires one discoverable route from failed-fix signal to
  source repair, executable workflow proof, regenerated mirror, and resumption.

Timeline:
- 2026-08-20: loaded Regression, Skill Creator, Autogoal, and Agent-Native
  Reviewer; created the active goal and captured all requirements.
- 2026-08-20: audited Regression source, template, contract test, generated
  resource sync, and the Benchmark semantic-validator precedent.
- 2026-08-20: attempt 1 failed final semantic validation, automatically
  invalidated its completion claim, centralized receipt canonicalization, added
  the reproducing mixed-path test, and passed attempt 2.

Decisions and tradeoffs:
- Add a Regression-specific semantic validator instead of expanding Autogoal's
  generic structural checker. The rules are lane-specific and old prose gates
  demonstrably failed.
- Keep proof receipts in the transient plan as generated Markdown rows. Do not
  create a durable JSON/TSV behavior registry.
- Define failed fix narrowly: a claimed candidate/kept/completed result that
  fails exact replay/final verification or receives a reporter contradiction.
  Expected red-before-green is not a workflow failure.

Review fixes:
- Agent-Native capability map passes: failed-fix signal routes from root guidance
  through Patch to Regression; source owners, generated mirrors, and executable
  proof are all discoverable.
- Accepted P1: a digest/count-only receipt hid which files were proved. The
  helper now records exact input paths and complete validation recomputes their
  digest from current bytes.
- Rejected: the generic Skill Creator quick validator treats the repo-supported
  `argument-hint` and `disable-model-invocation` keys as illegal. Skiller owns
  this repo's frontmatter and generated it successfully.
- Verdict: pass with no open P1 finding. This was Agent-Native review, not
  Autoreview.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial semantic test could not import the not-yet-created validator | 1 | Implement the smallest validator owner | Expected red established before implementation |
| `python` command unavailable for Skill Creator quick validation | 1 | Retry with `python3` | Helper ran; it then exposed the incompatible-frontmatter limitation below |
| Generic quick validator rejected repo-supported frontmatter keys | 1 | Use the repo's Skiller and source/mirror contract | Rejected as incompatible, not repaired around |
| First final receipt projection exceeded output budget | 1 | Preserve the exact command and show only its final row | `pipefail` plus `tail -n 1` returned the receipt with exit 0 |
| Attempt-1 completed receipt failed source/generated semantic closure | 1 | Invalidate the claim and run `regression repair` from the exact mismatch | Shared canonical contract plus mixed-path test passed on attempt 2 |

Verification evidence:
- `pnpm install` passed and regenerated the Regression/Patch skills and root
  agent mirror from source.
- Source and generated contract plus semantic tests passed 40/40 with zero
  retries on the superseded attempt-1 corpus; that receipt was invalidated by
  final semantic validation. Attempt 2 passed 42/42 under receipt
  `sha256:d6c70993126d2d00a349242d52b15fc87c1f4b1123f9dff396db3d9ab95ddcca`.
- The semantic corpus rejects all four historical reporter-invalidated plans,
  missing oracle/forbidden states, unproved failed-fix retries, missing Best API
  escalation, wrong browser environments, absent affected-corpus replay,
  tampered receipts, and changed proof inputs.
- `.agents/rules/plate-next/scripts/sync-resources.mjs --check` passed with exact
  source/generated resource parity.
- Source and generated `validate-regression-plan.mjs --complete` both report
  `Regression plan: semantically complete.`
- No lint or Autoreview command ran.

Final handoff:
- executable cases: `regression-false-fix-enforcement` completed; four old plans
  are negative fixtures and complete/failed-fix/receipt/browser cases pass.
- changed files: Regression rule, methodology, template, validator, receipt
  helper, workflow tests, Patch bridge, root routing rule, mirror-sync owner,
  generated mirrors, and this goal plan.
- design decisions: semantic completion is mandatory; reporter contradiction
  invalidates old proof; every failed claimed fix auto-repairs Regression; a
  second failure or architecture trigger requires Best API and a layer plan.
- tests and proof: attempt 1 invalidated; attempt 2 passed 42/42, dirty ref
  `1fb72c581095f23ddba3f597f41e8b10608283ef`, input digest
  `sha256:74bd3a2df71ab7bfe7423fb958a821464c68760bba40376dd127e9c978988a41`,
  zero retries.
- source/generated sync: `pnpm install`, contract parity, and resource sync
  passed.
- P1 and agent-native findings: one receipt-transparency P1 fixed; no open P1;
  no Autoreview by explicit user instruction.
- residual risks and next owner: tests remain the behavior authority; user can
  request commit/push when desired.
- local completion status and integration/public-status boundary: completed in
  the current dirty checkout; uncommitted, unpushed, and no public status changed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | final goal-plan check |
| Where am I going? | final response after semantic and Autogoal validation |
| What is the goal? | prevent false bug-fix completion and auto-repair Regression after any failed claim |
| What have I learned? | prose-only completion gates were the failure; exact oracles, receipts, and corpus replay are required |
| What have I done? | implemented, synced, tested, and reviewed the workflow repair |

Open risks:
- The validator can prove that a named executable assertion and forbidden state
  exist; it cannot judge whether arbitrary test code models the reporter
  correctly. The executable test remains the behavior authority.
- Exact Chrome claims still depend on a correctly managed Chrome host. The new
  checker refuses weaker environments, but this workflow-only case uses Node.
- The repair is local, uncommitted, and unpushed until the user requests Git
  mutation.
