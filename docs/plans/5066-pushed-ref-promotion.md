# 5066 pushed ref promotion

Objective:
Promote #5066 from a kept local regression to verified pushed completion; done when pushed fingerprints match, exact replay passes 5/5, ledger/checker pass, and GitHub has an honest proof comment plus `completed` label.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5066-pushed-ref-promotion.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: Plate homepage native typing performance issue #5066
- lane: Plate/Plite native-input and DOM-sync behavior
- master ledger path: `docs/editor-behavior/example-story-coverage.tsv`
- tested ref / expected ledger ref: resolve the exact pushed commit before replay; no dirty-ref promotion
- route or proof host: Plate homepage `/` from an exact-ref fresh host plus checked-in `perf:homepage-input`
- invocation mode / timebox: one-shot execution; no timebox
- selected case IDs: `homepage:native-typing-latency`

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop condition, deliverable, handoff section, verification surface, and success criterion into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md` and do not copy one run's routes, cases, refs, blockers, or results into reusable methodology.

Completion threshold:
- The five case-owned file fingerprints match one exact pushed commit.
- The exact homepage case passes five retry-free runs on a fresh host from that pushed ref, including 20/20 native inputs/commits, exact model/DOM/caret/focus, zero blockers/errors/long tasks, mutation p95 <=16 ms, and second-paint p95 <=32 ms.
- The existing 21-column row remains `kept` and validates as completion eligible against the pushed ref and exact owned-file manifest.
- P2 evidence is current or rerun if case-owned source changed; methodology delta is recorded.
- GitHub read-back shows the proof comment and `completed` label. The issue stays open unless the user explicitly says `close`.
- `check-complete.mjs` passes after final evidence is recorded.

Verification surface:
- local/remote ref equality plus Git object fingerprints for the five case-owned files
- `node .agents/skills/regression/scripts/validate-ledger.mjs --ledger docs/editor-behavior/example-story-coverage.tsv --expected-ref <pushed-ref> --selected-case homepage:native-typing-latency`
- exact-ref fresh-host `pnpm --filter www perf:homepage-input` repeated five times
- existing exact Chrome and P2 evidence only when source fingerprints match; otherwise rerun the invalidated gate
- live GitHub issue state, labels, comment read-back, and exact remote commit
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5066-pushed-ref-promotion.md`

Constraints:
- Regression owns the master plan, ledger, selection, proof width, packet decision, and methodology delta.
- `patch` owns exactly one normalized local behavior repair at a time.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source owners, ledgers, plans, generated output, package builds, or route hosts.
- Generated output is not a source owner. Repair source/generation and rerun the generator.
- Do not widen a local candidate into fixed, shipped, or completed wording without matching integration/release evidence.
- Do not create wrapper skills or put case-specific facts into reusable rules/templates.
- Do not call #5066 fixed/completed from local proof or a mismatched remote ref.
- Do not add `completed`, close, or post a success comment unless pushed-ref replay passes.
- Do not change product code unless the pushed-ref replay is red and the user-authorized regression loop requires a repair.

Boundaries:
- allowed source owners: read-only audit of the five case-owned files; product edits only if exact replay is red
- allowed proof/test owners: checked-in homepage performance harness, existing regression ledger, exact-ref fresh host, focused Git/GitHub reads
- generated/source boundary: no generated output edits; current source and Git object contents are authoritative
- browser/device claim width: desktop Chrome/homepage only; no physical-device or release claim
- public mutations: one evidence-backed issue comment and `completed` label are authorized; closing is not inferred from `complete`
- orchestration mode and writer ownership: single main writer; no subagents or parallel managed hosts

Output budget strategy:
- Start from exact owner files and current ledger rows. Count or artifact broad corpus scans. Cap logs and reviewer output. Do not stream generated trees, build output, raw corpora, or broad test inventories.

Blocked condition:
- Block only when the exact case cannot be observed on current source, the authoritative host/device/credential is unavailable, an unsafe owner/API decision requires user authority, or the same blocker leaves no safe alternate packet.
- A broken command shape, stale server, generated drift, or missing route host is a methodology repair target before it is a product blocker.

Regression state:
- current phase: blocked
- current case: `homepage:native-typing-latency`
- current case status: `kept` locally; pushed promotion unverified
- next owner: user supplies the pushed ref or authorizes committing/pushing the candidate
- goal status: blocked

Completion rule:
- Do not call `update_goal(status: complete)` while any required Work Checklist or Completion Gates row is unchecked or unresolved.
- Custom case, proof, stability, or methodology tables support the canonical gates; they never replace them.
- Run the ledger validator with `--require-complete` before the final plan checker.
- Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5066-pushed-ref-promotion.md` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Verify whether #5066 is fixed, confirm Regression coverage, replay pushed proof, then comment and add `completed` only if gates pass. |
| Regression methodology reference loaded | yes | Read `.agents/skills/regression/references/methodology.md` completely before goal setup. |
| Active goal checked or created | yes | New active goal matches this exact pushed-ref promotion objective and plan. |
| Master ledger path and exact tested ref recorded | yes | Ledger is named; exact pushed ref must be resolved before proof or mutation. |
| Current source owner resolved | yes | Five fingerprinted case owners from the existing kept row. |
| Route/proof-host readiness plan recorded | yes | Fresh exact-ref homepage host and checked-in harness; unexplained existing servers are forbidden. |
| Selected atomic cases and provenance recorded | yes | One existing atomic case, issue #5066 and Felix's report/comment. |
| Risk and test-decision policy recorded | yes | Existing 3+3+3+3=12 row uses `multi-layer`; five retry-free runs required. |
| Patch delegation boundary recorded | yes | N/A unless exact pushed replay is red; then one normalized case only. |
| Orchestrator writer ownership recorded | yes | N/A: orchestrator inactive; this thread is sole plan/ledger/public writer. |
| Output budget strategy recorded | yes | Exact refs/files and compact summaries only; browser/test logs capped. |
| Claim width and blocked rules recorded | yes | Desktop homepage pushed-ref claim only; mismatch or red replay blocks promotion, not investigation. |

Work Checklist:
- [x] Skill analysis complete: `regression` is the master, `patch` is the one-case worker, and the methodology reference is loaded.
- [x] First checkpoint complete: verify fixed status, prove Regression coverage, replay pushed ref, then comment/add `completed`; no closure inferred.
- [x] Objective, threshold, verification surface, constraints, boundaries, output budget, and blocked condition are concrete.
- [x] Current source owner, exact ref, route/proof host, runner entrypoint, package export/build path, and freshness method are recorded before behavior claims.
- [x] Generated/source boundaries are audited; refreshed remote refs contain no exact candidate tree, so promotion is blocked honestly.
- [x] Every selected case is atomic with stable ID, setup, action, expected outcome, owner, source refs, protocol decision, tested ref, and source fingerprints.
- [x] Every selected case has `impact`, `rewrite_exposure`, `browser_dependence`, and `proof_gap` in `0..3`, with exact `risk_score` sum.
- [x] Baseline verdict is recorded as evidence, conflicting evidence is preserved, and current accepted law is named.
- [x] Each case has one exact test decision: `multi-layer`.
- [x] The smallest high-value probe ran before scaling: refreshed remote refs plus exact five-blob comparison disproved the pushed-candidate assumption.
- [ ] Exact case reproduction and owner classification are recorded; proxy evidence stays labeled proxy.
- [ ] Exact red proof exists before the fix when possible, or the limitation and substitute evidence are explicit.
- [ ] Regression delegated only one normalized case at a time to `patch`, including the ledger row, invariant, red evidence, edit boundary, proof width, stability count, and return contract.
- [ ] Patch returned root cause, durable owner, changed files, exact red/green evidence, tested ref/fingerprints, stability, architecture-pressure verdict, P2 review, and caveat.
- [ ] Focused green proof ran on the owning source and fresh host; broader proof matches the claim width instead of running by habit.
- [ ] Required retry-free warm stability runs passed and every run is recorded, or N/A reason is evidence-backed.
- [ ] Each packet is explicitly kept, reverted, or quarantined; deferred/blocked cases name the owner, missing evidence, and next trigger.
- [x] Orchestrator mode is N/A; one main writer owns plan, ledger decision, and GitHub comment.
- [x] Every workflow slowdown records command/owner, elapsed estimate, evidence value, repair decision, and result.
- [x] Irrelevant skill loading and stale-host proof were avoided; no exact-ref host was started after the ref gate failed.
- [x] Methodology delta: `no-change` because exact-ref and validator gates correctly prevented a false `completed` promotion.
- [x] Reusable methodology repair is N/A: current Regression rules caught the miss mechanically.
- [x] Claim wording distinguishes local `kept` from pushed `fixed/completed`; GitHub comment states the exact boundary.
- [ ] Ledger schema, unique IDs, aligned columns, dimensions, exact sums, decisions, statuses, provenance, expected ref, selected-case set, exact owned-file fingerprint manifest, and completion eligibility pass the deterministic validator.
- [ ] Final handoff records changed files, decisions, tests, sync results, review findings, residual risks, and the exact fresh-worker prompt.
- [ ] Output budget discipline was followed; any accidental broad output is logged with the narrower recovery.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | pending | Close every selected case and methodology row with fresh evidence | pending |
| Current-source readiness | pending | Prove source owners and tested ref are current | pending |
| Route/proof-host readiness | pending | Prove the runner/host observes current source, or record a blocking limitation | pending |
| Atomic case/provenance closure | pending | Validate stable IDs, source refs, protocol decisions, refs, and fingerprints | pending |
| Risk/test decision closure | pending | Validate 0..3 dimensions, exact score sums, and claim-matched proof choices | pending |
| Smallest-probe closure | pending | Record the first falsifying probe and any harness repair before scale | pending |
| Reproduction/classification closure | pending | Record exact red behavior or `needs-repro`, plus durable owner | pending |
| Patch delegation closure | pending | Read back one-case red/green/root-cause/proof evidence from `patch` | pending |
| Focused verification closure | pending | Run owning-layer and exact final-case proof on current source | pending |
| Stability closure | pending | Record retry-free warm runs or evidence-backed N/A | pending |
| Packet decision closure | pending | Keep, revert, quarantine, defer, or block every selected row honestly | pending |
| Generated/source and host repair closure | pending | Repair drift/host methodology or record the exact blocked claim | pending |
| Orchestrator writer closure | pending | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pending |
| Workflow slowdown closure | pending | Repair avoidable slow/irrelevant/stale proof paths or defer with owner | pending |
| Methodology delta closure | pending | Resolve `repair-now`, `no-change`, or `defer` for every packet | pending |
| Regression ledger validation | pending | Run validator with `--expected-ref <tested-ref>` and every `--selected-case <case-id>` | pending |
| Regression completion eligibility | pending | Run validator with `--expected-ref`, every `--selected-case`, every case-owned `--owned-file`, and `--require-complete` | pending |
| Source/generated sync | pending | Run `pnpm install` and parity audit when reusable agent sources changed, otherwise N/A | pending |
| Agent-native review | pending | Run for changed skills/rules/templates/commands and close accepted findings, otherwise N/A | pending |
| Final handoff contract | pending | Record changed files, design decisions, proof, sync, reviews, risks, and fresh-worker prompt | pending |
| P2 autoreview | pending | Run P2 review for non-trivial implementation packets and close accepted findings, otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5066-pushed-ref-promotion.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Requirements, methodology, plan, and active goal recorded. | source/host readiness |
| Current source and proof-host readiness | blocked | Three consecutive audits found `origin/next` and upstream at `a18bab5...` with zero reachable commits matching all five candidate blobs. | pushed ref or explicit commit/push authority |
| Atomic case inventory and provenance | completed | Existing 21-column `homepage:native-typing-latency` row read and validated. | score and select |
| Risk score and proof decision | completed | 3+3+3+3=12, `multi-layer`, five retry-free runs. | smallest probe |
| Smallest high-value probe | completed | Remote five-blob scan and pushed-ref validator both rejected promotion. | obtain exact pushed ref |
| Reproduce, classify, and red proof | pending | | patch delegation |
| One-case patch delegation | pending | | verification |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Ledger validation and reviews | pending | | final handoff |
| Final handoff and goal-plan check | pending | | final response |

Selected case ledger readback:
| Case ID | Ledger path | Status | Risk score | Test decision | Tested ref / fingerprint | Next owner |
|---------|-------------|--------|------------|---------------|--------------------------|------------|
| `homepage:native-typing-latency` | `docs/editor-behavior/example-story-coverage.tsv` | kept locally | 12 | multi-layer | `dirty:a18bab5...`; pushed `a18bab5...` mismatches | user supplies/pushes exact candidate |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| `homepage:native-typing-latency` | five Plate/Plite runtime/harness owners | fresh clone/host only after ref match; `perf:homepage-input` ×5 | `git fetch origin`; every `origin/*` tree compared by exact blob | source is authoritative; no generated edits | blocked: no remote ref contains the candidate |

Patch delegation ledger:
| Case ID | Red evidence | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|--------------|---------------------|--------------------------|-----------------------|--------|
| `homepage:native-typing-latency` | N/A: no new red replay; ref gate failed first | N/A: no product edits authorized | N/A until exact pushed ref exists | Prior local Patch evidence remains in the original plan | not delegated |

Stability ledger:
| Case ID | Proof command / host | Required runs | Results | Retry count | Decision |
|---------|----------------------|---------------|---------|-------------|----------|
| `homepage:native-typing-latency` | exact pushed host + harness | 5 | not run: no matching pushed ref | 0 | promotion pending |

Packet decisions:
| Packet / case | Exact evidence | Decision | Claim width | Residual risk | Next owner |
|---------------|----------------|----------|-------------|---------------|------------|
| pushed promotion | dirty-ref validator passes; pushed-ref validator rejects `last_verified_ref` | local `kept`, public promotion blocked | desktop homepage only | candidate absent from every remote branch | user/ref authority |

Methodology deltas:
| Packet / case | Miss or owner checked | Decision | Durable owner / change | Focused proof | Trigger / result |
|---------------|-----------------------|----------|------------------------|---------------|------------------|
| `homepage:native-typing-latency` | exact-ref gate and public claim law | `no-change` | Regression methodology unchanged | dirty ref completion eligible; pushed ref fails closed | method worked as intended |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair decision / result |
|----------------|-------|--------------------|-------|----------------|--------------------------|
| remote ref scan | Git/GitHub | ~2 seconds / expected | none | disproved pushed assumption before expensive replay | no repair needed |

Findings:
- Existing local packet is `kept` and completion eligible only at a dirty ref; public fixed/completed promotion requires a matching pushed ref and fresh replay.
- `next`, its upstream, and `origin/next` all resolve to `a18bab5bba2d73e446523cbd848c5baeb19935f4`.
- All five case-owned files differ from that commit, and no refreshed `origin/*` branch contains the exact five current blobs.
- Each individual blob exists somewhere in reachable history, but no reachable commit contains all five simultaneously; the verified candidate is an uncommitted assembled tree, not a missed branch tip or ancestor.
- All five owned files have staged changes; `run-homepage-input-perf.mts` also has an unstaged fail-closed row guard. The final verified tree therefore differs from both `HEAD` and the current index.
- Dirty-ref validation returns `completionEligible: true`; pushed-ref validation fails because `last_verified_ref` is `dirty:a18bab5...`.
- GitHub remains open with labels `bug` and `performance issue`; no `completed` label was added.

Timeline:
- 2026-08-18: user invoked Regression and authorized evidence-backed issue completion/comment.
- 2026-08-18: loaded Regression methodology, found no active goal, and created this issue-backed promotion plan.
- 2026-08-18: refreshed `origin`, compared every remote branch by the exact five candidate blobs, and found no pushed match.
- 2026-08-18: posted and read back the honest promotion-blocked comment at `https://github.com/udecode/plate/issues/5066#issuecomment-5324926832`.
- 2026-08-18: automatic continuation repeated the fetch, remote-branch/PR audit, and all-history five-tree intersection; the same missing pushed commit blocker remains.
- 2026-08-18: third consecutive goal audit again found `HEAD == upstream == a18bab5...` and `matching_commit_count=0`; blocker threshold reached with no autonomous authorized move.

Decisions and tradeoffs:
- Interpret `complete` as the previously requested `completed` label plus comment; keep the issue open because the user did not say `close`.
- Do not replay a stale pushed ref or use local receipts to label the issue complete; stop before expensive browser work until an exact remote ref exists.

Review fixes:
- N/A: no code or reusable workflow changed; prior P2 evidence stays local and cannot promote the absent remote candidate.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| User believed the candidate was pushed, but remote trees do not contain it | 3 consecutive goal turns | Refresh origin, scan remote tips/PRs, then intersect all reachable history by all five exact blobs | No match; public promotion withheld, blocker commented, goal marked blocked pending authority/state change. |

Verification evidence:
- `git fetch origin` plus every `refs/remotes/origin/*` five-blob comparison -> zero matching refs.
- All-history intersection over commits touching the harness -> zero commits contain all five current blobs together.
- Per-file index/worktree audit -> five staged owners; harness additionally unstaged, so a later commit must capture the working-tree harness fingerprint.
- Local branch/upstream/`origin/next` -> exact `a18bab5bba2d73e446523cbd848c5baeb19935f4`.
- Dirty-ref ledger completion validation -> 21 columns, selected row `kept`, `completionEligible: true`.
- Pushed-ref ledger validation -> fails on exact dirty-vs-pushed `last_verified_ref` mismatch.
- GitHub read-back -> issue open, labels `bug` and `performance issue`, comment `5324926832` present.
- Autogoal checker -> correctly remains red while pushed-ref replay and completion gates are unresolved.

Final handoff contract:
- changed files: this promotion plan only; no product/ledger/source mutation
- design decisions: require exact remote tree before replay or public completion
- tests and proof: remote tree scan plus dirty/pushed validator contrast
- source/generated sync: N/A; no reusable agent source changed
- P2 and agent-native findings: N/A for this no-code blocked promotion packet
- residual risks and claim width: local kept candidate only; no fixed/shipped/completed claim
- exact fresh-worker prompt: `Verify the supplied pushed #5066 ref matches the five ledger fingerprints, run perf:homepage-input five retry-free times on a fresh exact-ref host, update the ledger ref, then comment/add completed only if every gate passes.`

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| blocked after three audits | user supplies exact pushed ref or authorizes commit/push, then resume fresh blocked audit | promote one kept case only after pushed-ref replay | candidate is absent from every reachable commit and pushing is not authorized | methodology prevented false completion; blocker comment read back |

Open risks:
- No pushed ref currently matches the local five-file manifest; the goal cannot complete without a supplied ref or push authorization.
- After a push, replay must use a fresh exact-ref host; existing local servers are not promotion evidence.

Blocked report:
- Attempted: three `git fetch origin` audits; remote tip scan; #5066 PR scan; all-history five-blob intersection; dirty/pushed ledger validation contrast; GitHub read-back.
- Evidence: `HEAD` and upstream remain `a18bab5bba2d73e446523cbd848c5baeb19935f4`; zero reachable commits contain all five current blobs; issue is open without `completed`.
- Blocker: the candidate has no pushed commit, and Regression does not authorize commit/push without a separate user instruction.
- Needed to continue: provide the pushed commit/branch, or explicitly authorize committing and pushing the current checkout.
