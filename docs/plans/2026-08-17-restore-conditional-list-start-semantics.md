# Restore conditional list start semantics

Status: superseded by
[`2026-08-17-finalize-list-start-and-restart-semantics.md`](./2026-08-17-finalize-list-start-and-restart-semantics.md).
This file records the rejected intermediate `listStartIfFirst` design and its
historical proof; it is not the current public contract.

Objective:
Restore conditional numbered-list start intent without derived ordinal JSON; done when exact v53 behavior, migration, docs/types, Browser proof, P2 review, and local `pnpm check` are green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-restore-conditional-list-start-semantics.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- docs
- package-api
- browser
- agent-native

Regression source:
- target bug / surface / corpus: v53 `listRestartPolite` behavior lost by the v54 boundary-only list rewrite
- lane: Plate List model, input rules, document migration, public docs, generated app contract
- master ledger path: `docs/plans/artifacts/list-conditional-start-regression/ledger.tsv`
- tested ref / expected ledger ref: `dirty-a18bab5b`
- route or proof host: List package tests, Plate migration tests, and `/blocks/editor-default-demo`
- invocation mode / timebox: one-shot execution; no timebox
- selected case IDs: `list:conditional-start-latent-intent`

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop condition, deliverable, handoff section, verification surface, and success criterion into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md` and do not copy one run's routes, cases, refs, blockers, or results into reusable methodology.

Completion threshold:
- Every selected case has one valid 21-column ledger row and reaches `kept` with current evidence. Reverted, quarantined, deferred, or blocked packets prevent goal completion and use their honest continuation/blocked path.
- Current source and every proof host are ready before behavior claims; stale source, generated drift, and stale-server findings are repaired or explicitly block the claim.
- Each kept case has exact reproduction/red-proof accounting, one-case `patch` delegation, focused green proof, required retry-free stability, current ref/fingerprints, and no accepted P2 finding.
- Every packet records `repair-now`, evidence-backed `no-change`, or evidence-backed `defer` for the methodology.
- The ledger validator passes with `--expected-ref`, every selected `--selected-case`, every case-owned `--owned-file`, and `--require-complete`; all canonical Work Checklist and Completion Gates rows resolve; `check-complete.mjs` passes.
- `listStart` remains the unconditional explicit boundary and derived ordinals remain read-time state; one separately named conditional field preserves v53 polite intent while ignored and after topology changes.
- Frozen v53 `listRestart` maps to unconditional `listStart`; `listRestartPolite` maps to the conditional field; derived legacy `listStart` does not survive as ordinary per-item state.
- Ordered input rules use conditional intent rather than forcing an unconditional restart beside an existing sequence.
- Package/app/generated/docs/browser proof passes, then the repo's local CI command `pnpm check` exits zero. Actual hosted GitHub Actions is not claimed without a pushed ref.

Verification surface:
- `node .agents/skills/regression/scripts/validate-ledger.mjs --ledger <ledger.tsv> --expected-ref <tested-ref> --selected-case <case-id>`
- focused unit, DOM, Playwright, Browser, or device proof chosen per case
- exact final-case replay and retry-free stability rows when required
- P2 autoreview for non-trivial implementation packets
- `pnpm --filter @platejs/list typecheck && pnpm --filter @platejs/list test`
- `pnpm --filter platejs typecheck && pnpm --filter platejs test`
- `pnpm --filter www typecheck`, focused Browser replay, generated editor `--check`, and `pnpm check`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-restore-conditional-list-start-semantics.md`

Constraints:
- Regression owns the master plan, ledger, selection, proof width, packet decision, and methodology delta.
- `patch` owns exactly one normalized local behavior repair at a time.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source owners, ledgers, plans, generated output, package builds, or route hosts.
- Generated output is not a source owner. Repair source/generation and rerun the generator.
- Do not widen a local candidate into fixed, shipped, or completed wording without matching integration/release evidence.
- Do not create wrapper skills or put case-specific facts into reusable rules/templates.
- Preserve unconditional starts, restarts at one, nested sequences, custom sibling traversal, split behavior, HTML/MDAST boundaries, and read-time ordinal derivation.
- No compatibility alias, derived ordinal persistence, commit, push, PR, or claim that hosted CI ran.

Boundaries:
- allowed source owners: `packages/list`, `packages/plate/src/migrations`, affected current-state docs/Vision, generated www editor contract, and release metadata
- allowed proof/test owners: List and Plate migration specs, generated contract checks, www typecheck, default editor Browser route, and root CI scripts
- generated/source boundary: package schemas and `plugins.ts` are source; `plugins.generated.ts` and `plugins.schema.json` regenerate through `plate generate`
- browser/device claim width: ordinary Browser proof for input-rule/list rendering; no native Chrome/device claim
- forbidden product/API/release/public mutations: no list-classic change, no Plite substrate change, no templates, no commit/push/PR/release
- orchestration mode and writer ownership: root thread is the sole writer; multi-agent delegation is disabled, so the root follows the one-case Patch workflow locally

Output budget strategy:
- Start from exact owner files and current ledger rows. Count or artifact broad corpus scans. Cap logs and reviewer output. Do not stream generated trees, build output, raw corpora, or broad test inventories.

Blocked condition:
- Block only when the exact case cannot be observed on current source, the authoritative host/device/credential is unavailable, an unsafe owner/API decision requires user authority, or the same blocker leaves no safe alternate packet.
- A broken command shape, stale server, generated drift, or missing route host is a methodology repair target before it is a product blocker.

Regression state:
- current phase: complete
- current case: `list:conditional-start-latent-intent`
- current case status: kept
- next owner: none
- goal status: complete

Completion rule:
- Do not call `update_goal(status: complete)` while any required Work Checklist or Completion Gates row is unchecked or unresolved.
- Custom case, proof, stability, or methodology tables support the canonical gates; they never replace them.
- Run the ledger validator with `--require-complete` before the final plan checker.
- Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-restore-conditional-list-start-semantics.md` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Restore the accepted conditional-start behavior and make every applicable local CI gate green; do not claim hosted CI without a push. |
| Regression methodology reference loaded | yes | Full methodology read before ledger creation and test edits. |
| Active goal checked or created | yes | Prior goal is complete; this correction gets a new measurable goal after this checkpoint. |
| Master ledger path and exact tested ref recorded | yes | One-row ledger at `docs/plans/artifacts/list-conditional-start-regression/ledger.tsv`; expected ref `dirty-a18bab5b`. |
| Current source owner resolved | yes | `BaseListPlugin` owns schema, ordinal traversal, operations, input rules, and codecs; `migratePlateV54` owns release conversion. |
| Route/proof-host readiness plan recorded | yes | Source-first package runners plus fresh `/blocks/editor-default-demo`; regenerate/check www contract after schema change. |
| Selected atomic cases and provenance recorded | yes | `list:conditional-start-latent-intent` cites frozen v53.3.6 normalizer/input-rule law and current v54 source. |
| Risk and test-decision policy recorded | yes | Risk 9 = impact 2 + rewrite 3 + browser 1 + gap 3; multi-layer proof. |
| Patch delegation boundary recorded | yes | One case, List + migration + current docs/generated contract only; root executes Patch locally because delegation is disabled. |
| Orchestrator writer ownership recorded | yes | N/A: orchestrator is inactive; root is sole writer. |
| Output budget strategy recorded | yes | Narrow owner reads, focused red/green commands, capped CI/reviewer output. |
| Claim width and blocked rules recorded | yes | Verified-local only; hosted GitHub CI requires a pushed ref and remains unclaimed. |
| Docs pack selected | yes | Public list and document-model pages teach the changed persisted contract. |
| `docs-creator` loaded | yes | Load before docs edits. |
| Docs lane selected | yes | List plugin page plus cross-package document model, English and Chinese. |
| Target docs and nearest sibling docs read | yes | Existing List and document-model source pages identified; read before editing. |
| Docs style doctrine read | yes | Current-state source-backed reference voice required. |
| Documented source owner identified | yes | `@platejs/list` schema/runtime and Plate migration are authoritative. |
| Package/API pack selected | yes | Published `@platejs/list` schema, operation, generated types, and migration change. |
| Public surface or package boundary identified | yes | List package plus umbrella Plate migration; no Plite/list-classic change. |
| Release artifact path selected | yes | Update the existing `semantic-flat-lists` major changeset because this corrects the same unshipped hard cut. |
| `changeset` skill loaded when `.changeset` is required | yes | Load before release artifact edit. |
| Barrel/export impact decision recorded | yes | No exported file move; run `pnpm brl` only if export generation changes. |
| Browser pack selected | yes | Input-rule behavior is user-visible editing behavior. |
| Browser route / app surface identified | yes | `/blocks/editor-default-demo` with a fresh list input-rule interaction. |
| Browser tool decision recorded | yes | In-app Browser; Chrome/Computer not required. |
| Console/network caveat policy recorded | yes | New console/runtime errors block local completion; unrelated warnings remain exact caveats. |
| Observable browser case captured | yes | Type an ordered marker adjacent to a numbered sequence, then verify the displayed sequence and follow-up typing on final source. |
| Agent-native pack selected | yes | Public schema/docs/generator discoverability must remain coherent. |
| Agent-facing action surface identified | yes | Agents author `listStart` and the conditional field, input rules, migrations, and generated contracts. |
| Source rule versus generated mirror boundary identified | yes | Product-specific list law belongs in source/docs, not a generic Best API rule; agent rule edits are expected N/A unless audit finds stale teaching. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Load for final public-action audit; mirror sync only if source rules change. |

Work Checklist:
- [x] Skill analysis complete: `regression` is the master, `patch` is the one-case worker, and the methodology reference is loaded.
- [x] First checkpoint complete: every explicit requirement, scope boundary, timing rule, stop condition, deliverable, final handoff section, verification surface, and success criterion is captured before mutable work.
- [x] Objective, threshold, verification surface, constraints, boundaries, output budget, and blocked condition are concrete.
- [x] Current source owner, exact ref, route/proof host, runner entrypoint, package export/build path, and freshness method are recorded before behavior claims.
- [x] Generated/source boundaries are audited; any drift, wrong owner, or route-host dependency is repaired or blocks the claim honestly.
- [x] Every selected case is atomic with stable ID, setup, action, expected outcome, owner, source refs, protocol decision, tested ref, and source fingerprints.
- [x] Every selected case has `impact`, `rewrite_exposure`, `browser_dependence`, and `proof_gap` in `0..3`, with exact `risk_score` sum.
- [x] Baseline verdict is recorded as evidence, conflicting evidence is preserved, and current accepted law is named.
- [x] Each case has one exact test decision: `unit`, `dom`, `playwright`, `browser`, `device`, `multi-layer`, `no-test-with-evidence`, `needs-repro`, or `defer-with-owner`.
- [x] The smallest high-value probe ran before scaling; command-shape, stale-server, source/export, or host failures were repaired before more cases were added.
- [x] Exact case reproduction and owner classification are recorded; proxy evidence stays labeled proxy.
- [x] Exact red proof exists before the fix when possible, or the limitation and substitute evidence are explicit.
- [x] Regression delegated only one normalized case at a time to `patch`, including the ledger row, invariant, red evidence, edit boundary, proof width, stability count, and return contract.
- [x] Patch returned root cause, durable owner, changed files, exact red/green evidence, tested ref/fingerprints, stability, architecture-pressure verdict, P2 review, and caveat.
- [x] Focused green proof ran on the owning source and fresh host; broader proof matches the claim width instead of running by habit.
- [x] Required retry-free warm stability runs passed and every run is recorded, or N/A reason is evidence-backed.
- [x] Each packet is explicitly kept, reverted, or quarantined; deferred/blocked cases name the owner, missing evidence, and next trigger.
- [x] Orchestrator mode, when active, used one master writer for shared plan/ledger state and no parallel writers for overlapping owners or hosts.
- [x] Every workflow slowdown records command/owner, elapsed estimate, evidence value, repair decision, and result.
- [x] Irrelevant skill loading, wrong command shape, stale server, proof-host drift, generated drift, and noisy/broad proof were repaired in their durable owner or deferred with evidence.
- [x] Every packet records one methodology delta: `repair-now`, evidence-backed `no-change`, or evidence-backed `defer` with owner and trigger.
- [x] Reusable methodology repairs changed source rules/resources only, ran focused proof, and synced generated mirrors when applicable.
- [x] Claim wording distinguishes reproduced, candidate-local, verified-local, kept, fixed, shipped, and completed according to actual evidence.
- [x] Ledger schema, unique IDs, aligned columns, dimensions, exact sums, decisions, statuses, provenance, expected ref, selected-case set, exact owned-file fingerprint manifest, and completion eligibility pass the deterministic validator.
- [x] Final handoff records changed files, decisions, tests, sync results, review findings, residual risks, and the exact fresh-worker prompt.
- [x] Output budget discipline was followed; any accidental broad output is logged with the narrower recovery.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected case and methodology row with fresh evidence | One selected row is `kept`; local `pnpm check` exits zero. |
| Current-source readiness | yes | Prove source owners and tested ref are current | Current source and final SHA-256 manifest recorded under `dirty-a18bab5b`. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source, or record a blocking limitation | Package and root runners observe final source; Browser URL policy blocked the local route and is recorded without bypass. |
| Atomic case/provenance closure | yes | Validate stable IDs, source refs, protocol decisions, refs, and fingerprints | One v53-backed atomic case validates. |
| Risk/test decision closure | yes | Validate 0..3 dimensions, exact score sums, and claim-matched proof choices | 2+3+1+3=9; package, migration, Markdown, integration, generated, and CI proof complete. |
| Smallest-probe closure | yes | Record the first falsifying probe and any harness repair before scale | Red package tests ran after one mandated reinstall. |
| Reproduction/classification closure | yes | Record exact red behavior or `needs-repro`, plus durable owner | List had 3 red failures; Plate migration had 1. Owner is List plus release migration. |
| Patch delegation closure | yes | Read back one-case red/green/root-cause/proof evidence from `patch` | Root executed the one-case Patch workflow locally under disabled delegation. |
| Focused verification closure | yes | Run owning-layer and exact final-case proof on current source | List 36, List slow 5, Plate 47, Markdown 194, playground rules 25. |
| Stability closure | N/A | Record retry-free warm runs or evidence-backed N/A | Deterministic model/schema behavior; no native/flaky claim. |
| Packet decision closure | yes | Keep, revert, quarantine, defer, or block every selected row honestly | Case is `kept`. |
| Generated/source and host repair closure | yes | Repair drift/host methodology or record the exact blocked claim | Generated contract synced; Browser local URL remains policy-blocked. |
| Orchestrator writer closure | N/A | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | Orchestrator inactive; root was sole writer. |
| Workflow slowdown closure | yes | Repair avoidable slow/irrelevant/stale proof paths or defer with owner | Reinstall repaired aliases; formatter fixed CI drift; repeated check stopped after exact green. |
| Methodology delta closure | yes | Resolve `repair-now`, `no-change`, or `defer` for every packet | `repair-now`: Best API/Vision now distinguish derived state from latent intent. |
| Regression ledger validation | yes | Run validator with `--expected-ref <tested-ref>` and every `--selected-case <case-id>` | Validator passes. |
| Regression completion eligibility | yes | Run validator with `--expected-ref`, every `--selected-case`, every case-owned `--owned-file`, and `--require-complete` | Completion eligible with 8 exact owned files. |
| Source/generated sync | yes | Run `pnpm install` and parity audit when reusable agent sources changed, otherwise N/A | `pnpm install` synced Best API mirrors; generated editor artifacts contain the field. |
| Agent-native review | yes | Run for changed skills/rules/templates/commands and close accepted findings, otherwise N/A | Capability map passes: public docs/types -> List owner -> generator/package/CI proof. |
| Final handoff contract | yes | Record changed files, design decisions, proof, sync, reviews, risks, and fresh-worker prompt | Recorded below. |
| P2 autoreview | yes | Run P2 review for non-trivial implementation packets and close accepted findings, otherwise N/A | One finding rejected: frozen v53 emitted `ol[start]`, not the claimed private data attributes; existing continuation test covers it. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-restore-conditional-list-start-semantics.md` | Run after final plan update. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | EN/CN List and document-model claims match schema, ordinal, input-rule, codec, and migration owners. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Existing List preview/links unchanged; registry source check passes. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | www build:source and docs source parity passed. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing plugin-page topology retained; current API and format limit documented. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `@platejs/list` owns schema/API; Plate owns migration; no Plite/list-classic change. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published major List contract correction. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `semantic-flat-lists` major changeset updated. |
| Registry changelog | N/A | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Package API/runtime change, not registry-only. |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Published package delta has a changeset. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Focused owners and all 60 package build/typecheck tasks pass. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No exported file topology changed. |
| Browser interaction proof | N/A | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser security policy blocked localhost and forbade alternate surfaces. |
| Browser console/network check | N/A | Record console/network state or why it is not applicable | No page session was permitted by Browser policy. |
| Browser final proof artifact | N/A | Record screenshot/trace/route/native proof or exact caveat | Exact Browser policy rejection recorded; no bypass attempted. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Deterministic package/integration replay covers ignored, activated, input-rule, split, HTML, Markdown, and migration behavior. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Dirty ref and 8-file SHA-256 manifest validate. |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | Local uncommitted candidate; no pushed-ref claim. |
| Retry-free stability | N/A | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Pure model/schema/input-rule contract. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Best API source and generated skill both contain latent-intent law. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Best API, public List docs, generated Editor types, and package JSDoc expose the contract. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; no P1/P2 parity gap. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Plan, goal, ledger, packs, and explicit CI claim boundary recorded. | source/host readiness |
| Current source and proof-host readiness | completed | One mandated reinstall repaired package resolution; source-aware package runners now execute. | case inventory |
| Atomic case inventory and provenance | completed | One v53-backed case in the 21-column ledger. | score and select |
| Risk score and proof decision | completed | Risk 9, multi-layer proof. | smallest probe |
| Smallest high-value probe | completed | List and Plate owner tests selected before broader CI. | reproduce/classify |
| Reproduce, classify, and red proof | completed | List 31/34 with 3 exact failures; Plate 45/46 with 1 exact migration failure. | patch delegation |
| One-case patch delegation | completed | Root followed Patch locally under the normalized case packet. | verification |
| Focused verification and stability | completed | Focused owners, integration fixture, generated contract, and root CI passed. | packet decision |
| Keep/revert/quarantine | completed | One case kept. | methodology delta |
| Methodology repair/no-change/defer | completed | Best API/Vision repaired derived-state versus latent-intent law. | next case or closure |
| Ledger validation and reviews | completed | Completion validator passes; P2 finding rejected with frozen-source proof; agent-native PASS. | final handoff |
| Final handoff and goal-plan check | completed | Evidence and caveats recorded; checker is the final mechanical gate. | final response |

Selected case ledger readback:
| Case ID | Ledger path | Status | Risk score | Test decision | Tested ref / fingerprint | Next owner |
|---------|-------------|--------|------------|---------------|--------------------------|------------|
| list:conditional-start-latent-intent | `docs/plans/artifacts/list-conditional-start-regression/ledger.tsv` | kept | 9 | multi-layer | `dirty-a18bab5b`; final 8-file manifest in ledger | handoff |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| list:conditional-start-latent-intent | `@platejs/list` and `platejs/migrations` | package scripts; Browser route policy-blocked | Reinstall completed; source-aware package runners and root CI reach final source | Package schema is source; generated contract check passes | ready with Browser caveat |

Patch delegation ledger:
| Case ID | Red evidence | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|--------------|---------------------|--------------------------|-----------------------|--------|
| list:conditional-start-latent-intent | List 3 failures and Plate migration 1 failure | List, migration, Markdown, docs/generated contract | focused package green, root `pnpm check`, P2 source review; Browser caveat | List 36, slow 5, Plate 47, Markdown 194, playground 25, `pnpm check` zero | kept |

Stability ledger:
| Case ID | Proof command / host | Required runs | Results | Retry count | Decision |
|---------|----------------------|---------------|---------|-------------|----------|
| list:conditional-start-latent-intent | Package tests plus root `pnpm check` | 1 deterministic run per focused owner plus full fast/slow/slowest | Focused and aggregate results all green | 0 retries | kept |

Packet decisions:
| Packet / case | Exact evidence | Decision | Claim width | Residual risk | Next owner |
|---------------|----------------|----------|-------------|---------------|------------|
| list:conditional-start-latent-intent | Ledger red/green evidence, 8-file fingerprints, root `pnpm check` zero | kept | verified-local current dirty checkout | Browser local URL policy block; www full tsc has unrelated leaf-type failures outside root CI | no product owner remains |

Methodology deltas:
| Packet / case | Miss or owner checked | Decision | Durable owner / change | Focused proof | Trigger / result |
|---------------|-----------------------|----------|------------------------|---------------|------------------|
| list:conditional-start-latent-intent | Original API audit mislabeled latent conditional intent as removable policy | repair-now | `.agents/rules/best-api.mdc` and `docs/vision/plate.md` distinguish derived state from latent intent | `pnpm install`, mirror `rg`, generated contract, agent-native map | future API migrations must preserve inactive observable intent |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair decision / result |
|----------------|-------|--------------------|-------|----------------|--------------------------|
| Initial package red command | package proof host | ~1m / seconds | Workspace aliases unavailable until prepare/build finished | Necessary red proof | One mandated reinstall; rerun reached exact red tests. |
| Repeated `pnpm check` | root CI | 3 runs / one final run | Concurrent unrelated edits introduced formatter/lint drift and one stale playground oracle | Exact user-requested CI evidence | Mechanical blockers fixed; final exact run exits zero. |
| P2 autoreview | scoped List/migration/Markdown bundle | ~3m / expected model latency | External reviewer raised one historical clipboard claim | Useful source pressure | Rejected after frozen v53 source showed no claimed data attributes; existing wrapper-continuation test covers real v53 HTML. |

Findings:
- v53 `listStart` was derived display state, `listRestart` was unconditional intent, and `listRestartPolite` was retained conditional intent.
- v54 correctly derives ordinary ordinals and maps unconditional restarts to `listStart`, but drops inactive conditional intent and makes ordered input rules unconditional.
- Accepted target: add `listStartIfFirst` as the conditional persisted field; keep `listStart` unconditional and keep ordinary ordinals derived.

Timeline:
- 2026-08-17T22:48:00+02:00 user accepted the conditional-start correction and requested green CI.
- 2026-08-17T23:19:10+02:00 focused owners, generated contract, root CI, reviews, and ledger closed.

Decisions and tradeoffs:
- Two numeric intent fields beat a mode field with an invalid cross-property state: `listStart` is unconditional; `listStartIfFirst` is independently conditional.
- HTML internal clipboard preserves the conditional field in Plate data attributes. MDAST emits the currently visible start because Markdown has no latent conditional-start concept.
- No Plite primitive, list-classic change, alias, or historical normalizer is justified.

Review fixes:
- P2 finding rejected: v53 rendered one `ol[start]` per flat item and did not emit `data-list-start`/restart attributes. Current continuation decoding already drops sequential wrapper starts, covered by the multi-wrapper HTML regression test.
- Agent-native review PASS: human and agent routes both reach public docs/types, List/migration source, generator checks, package tests, and root CI.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct `bun test` and first package scripts could not resolve workspace packages | 2 | Run the repo-mandated reinstall once, then rerun package-owned scripts | Resolver recovered after install prepare completed; authoritative red tests executed. |
| First root check stopped on unrelated formatter/lint drift | 2 | Run the repository formatter and apply two behavior-neutral lint rewrites | Final lint and exact `pnpm check` pass. |
| First slow CI pass expected unconditional playground starts | 1 | Update the two current-contract oracles to conditional starts | Exact playground file 25/25, then full CI green. |

Verification evidence:
- Red: List 31/34 with three failures; Plate migration 45/46 with one failure.
- Focused green: List 36/36, List slow 5/5, Plate 47/47, Markdown 194/194, playground rules 25/25.
- Generated/docs: editor `--check`, API reference check, MDX build, docs parity, registry source check all pass. Generated Editor types/schema contain `listStartIfFirst`.
- Root CI: final `pnpm check` exits zero; lint, 60 package builds/typechecks, 3,135 fast tests, 1,519 slow tests with 60 skips, and the slowest budget lane pass.
- Separate www full TypeScript remains red in unrelated Search Highlighting, Comment, and Suggestion leaf-type work; root `pnpm check` does not run that app TSC. Relevant generated/docs checks pass before those unrelated errors.
- Browser: localhost navigation was rejected by Browser security policy, which explicitly prohibited alternate browser/control workarounds. No Browser behavior claim is made.
- Ledger validator passes with `--require-complete`, one kept row, and exact 8-file SHA-256 ownership.

Final handoff contract:
- changed files: List runtime/tests, Plate migration/tests, Markdown serializer/tests, playground integration oracle, EN/CN docs, generated Editor contract, existing List changeset, Best API rule/mirror, Plate Vision, and mechanical unrelated CI formatting/lint blockers.
- design decisions: unconditional `listStart`, conditional `listStartIfFirst`, derived `read.list.ordinal`; no policy mode object, aliases, Plite/list-classic changes, or historical normalizers.
- tests and proof: focused counts, generated/docs checks, exact root `pnpm check` green, Browser policy caveat.
- source/generated sync: `pnpm install` and `plate generate` completed; source/mirror/generated field scan passes.
- P2 and agent-native findings: historical clipboard finding rejected; agent-native PASS.
- residual risks and claim width: verified-local uncommitted candidate; hosted GitHub Actions not run; separate www TSC has unrelated failures.
- exact fresh-worker prompt: `Audit listStartIfFirst on the current checkout only: verify conditional activation/deactivation, v53 migration, HTML/Markdown limits, generated Editor types, pnpm check receipt, and reject unrelated www leaf-type work.`

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| complete | final handoff | preserve conditional list-start intent and make local CI green | Latent author intent is not derived state; migration snapshots cannot replace it. | One kept regression packet, source/docs/generated adoption, root CI green. |

Open risks:
- Hosted GitHub Actions did not run because no commit/push/PR was authorized. The exact documented local CI command is green.
- Browser proof is unavailable due the Browser URL security policy.
- `pnpm --filter www typecheck` still reports unrelated leaf-type errors in Search Highlighting, Comment, and Suggestion; relevant generator/docs checks pass and root CI is green.
