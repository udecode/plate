# Fix Plite package metadata

Objective:
Prove and fix the Plite package-boundary findings, pivot on every source-owned CI failure, and finish with isolated-consumer proof, strict Plite proof, root `pnpm check`, and P1 review green.

Completion threshold:
- `@platejs/plite-react` does not install history for production consumers.
- `@platejs/yjs/core` installs and typechecks without Plate or React packages.
- Plate and React Yjs entrypoints retain explicit optional peer contracts.
- Fresh packed consumers pass runtime imports and strict TypeScript checks.
- `pnpm check:plite` and root `pnpm check` pass on the final code.
- P1 autoreview reports zero accepted or actionable findings.

Verification surface:
- Package manifests, lockfile, package-config contracts, built entry graphs, and fresh packed npm consumers.
- Plite package tests, typechecks, contracts, production build, and Chromium browser corpus.
- Exact selection, cursor-overlay, Prism, and synchronous-update regressions exposed by strict CI.
- Root lint, package builds, package typechecks, fast tests, slow tests, and slowest-test budget report.
- Regression workflow source tests, generated tests, and source/mirror byte parity.

Constraints:
- Keep the repair inside the proven owner boundaries.
- Do not split `@platejs/yjs` unless packed-consumer proof disproves a metadata-only correction.
- Do not weaken the Plate or React integration contracts.
- Do not invent a public selection-timing API or weaken browser assertions.
- Do not commit, push, open a PR, or mutate public trackers without explicit authorization.

Boundaries:
- Source of truth: the user request, current manifests and entry graphs, `VISION.md`, package contracts, exact browser cases, and executable CI gates.
- Allowed edits: package metadata/contracts, lockfile consequences, the smallest source-owned fixes required by strict CI, Regression workflow repair after invalid proof, lint policy needed for correct compiler behavior, and this plan.
- Non-goals: Yjs package split, broad public API redesign, unrelated lint migration cleanup, documentation rewrite, commit, push, or PR creation.
- Existing major changesets already own the package introductions and redesign relative to `main`; no branch-relative cleanup changeset is added.

Blocked condition:
Stop only after the same external or environment-only blocker repeats three times and no narrower owning proof remains. Source-owned failures require repair and exact rerun.

Task state:
- task_type: published package-boundary correction with CI closure
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A: all authorized work and proof are complete
- goal_status: ready_for_completion

Current verdict:
- `plite-react -> plite-history` was a manifest defect and is fixed by moving history to `devDependencies`.
- Yjs does not need a package split. Optional Plate/React peers plus development dependencies preserve upper entrypoints while keeping `./core` headless.
- The review's API-collision claim remains deleted; no reachable public collision was proved.
- Explicit fixture cuts remain owned by the separate Regression effort.

Work Checklist:
- [x] Captured the user request, completion conditions, scope, non-goals, stop condition, verification, and final handoff before implementation.
- [x] Read the relevant Vision, Best API, package, changeset, Regression, review, Browser, and lint-policy owners before acting.
- [x] Audited runtime and declaration imports before changing package metadata.
- [x] Added package-owned manifest contracts and updated the lockfile through `pnpm install`.
- [x] Packed the affected packages and proved isolated install, runtime import, and strict TypeScript consumption.
- [x] Reproduced every strict-CI failure before fixing its owner.
- [x] Replayed focused cases, affected browser corpus, strict Plite, and root CI after the final owner edits.
- [x] Ran agent-native workflow proof and P1 autoreview.
- [x] Recorded the auxiliary Oxlint policy audit honestly without treating unrelated migration debt as task failure.
- [x] Prepared the final handoff with outcome, design, verification, caveat, and mutation status.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Objective, thresholds, constraints, boundaries, and checklist encode “go prove,” green CI, and pivot-on-failure. |
| Active goal | yes | Matching autogoal and this durable plan were created before implementation. |
| Source owners read | yes | Read Vision, package sources, built graphs, package patterns, related solutions, and owning skills. |
| Package/API decision | yes | Packed graph proof selected metadata correction and rejected a Yjs split. |
| Changeset decision | yes | Existing major changesets own the `main`-relative package delta; another note would be branch-relative. |
| Browser decision | yes | Strict CI exposed production browser failures, so exact Chromium and Browser evidence became required. |
| PR/tracker authority | no | N/A: the user requested local proof and repair only. |

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Package boundary | yes | Manifest contracts, packed artifacts, isolated runtime imports, and strict consumer typechecks pass. |
| Install graph | yes | `pnpm install` passed and `pnpm-lock.yaml` reflects the corrected dependency placement. |
| Package tests/build/typecheck | yes | Owning Plite React, Yjs, Plite DOM, Plite, and Selection lanes pass; strict Plite reran the complete owner set. |
| Browser behavior | yes | Fresh production Chromium completed 79/79 bounded batches: 707 passed, 6 skipped, zero failed. |
| Root CI | yes | Final root `pnpm check` exited 0 after lint, 61-package build, 60-package typecheck, 3,252 fast tests, 1,542 slow passes, 60 skips, and slowest-test reporting. |
| Agent-native workflow | yes | Regression source suite 27/27, generated suite 27/27, and four source/mirror resources are byte-identical. |
| P1 autoreview | yes | Bounded exact 41-file snapshot, 314,525 bytes, one model pass; zero accepted/actionable P0 or P1 findings. |
| Final lint | yes | `pnpm lint` exited 0; root `pnpm check` repeated that result. |
| Changeset | no | N/A: existing major release records already own the public delta from `main`. |
| Barrels | no | N/A: no export or exported file layout changed. |
| Registry changelog | no | N/A: no registry component changed. |
| PR/tracker sync | no | N/A: no PR or tracker mutation was authorized. |
| Output budget | yes | One temporary baseline commit produced accidentally broad output; later commands were capped and summarized. |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and source audit | complete | Runtime/declaration graphs and package policy established the two real boundaries. | implementation |
| Implementation | complete | Metadata, contracts, lockfile, and source-owned CI repairs are applied locally. | verification |
| Verification | complete | Packed consumers, strict Plite, root check, agent-native proof, and P1 review pass. | closeout |
| PR / tracker sync | N/A | No external mutation was requested. | closeout |
| Closeout | complete | Final evidence and residual policy debt are recorded here. | user handoff |

Failure and pivot record:

| Gate | Failure | Proven owner | Repair | Final proof |
| --- | --- | --- | --- | --- |
| Strict Plite package tests | A lint rewrite stopped returning an async callback, hiding the thenable from the synchronous-update guard. | `updateEditor` transaction callback | Restore the callback result so `runEditorTransaction` can reject it. | Exact contract passes; strict package suite passes. |
| Production Prism route | Static side-effect imports evaluated grammars before global Prism initialization. | Example runtime initialization | Ordered CommonJS runtime helper; TypeScript loads before TSX. | Focused examples pass and fresh full Chromium passes. |
| Multi-root selection | Projected drags imported transient DOM selection and blank root-edge input retained stale native ranges. | Plite React root interaction and selection controllers | Guard projection imports, resolve the terminal endpoint, and clear owned blank-edge DOM selection. | Focused retries and full Chromium pass. |
| #5091 selection paint | Endpoint timing experiments and the first pixel classifier gave misleading evidence. | Cursor overlay range identity cache | Invalidate cached cursor ranges on document commit; never resurrect removed cursor keys. | Cursor-overlay tests, exact #5091 browser proof 5/5, selection suite, and full Chromium pass. |
| Root lint | A block-wide Prism disable violated policy; the first narrowed version named an unused rule. | Prism helper directives | Use exact next-line exceptions with only the rules each line triggers. | `pnpm lint` and root `pnpm check` pass. |

Agent-native review:

| User action | Route | Source owner | Generated owner | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Repair invalid Regression completion evidence | `regression repair <case-id>` | `.agents/rules/regression.mdc` plus methodology and scripts | `.agents/skills/regression/**` | 27/27 source tests, 27/27 generated tests, byte parity | pass |
| Route research findings to Regression | editor-test-harvester and plite-research rules | `.agents/rules/*.mdc` | matching generated skills | generated contract test and mirror audit | pass |

Agent-native verdict:
PASS. The user action has a discoverable route, one durable source owner, synchronized generated resources, and executable local proof.

Verification evidence:
- Fresh packed consumers installed, ran, and strict-typechecked Plite React without history and Yjs `./core` without Plate, Plite React, React, or React DOM.
- `pnpm check:plite` exited 0 in 396,877 ms: typecheck, package tests, contracts, and Chromium all passed.
- Chromium result: 707 passed, 6 skipped, zero failed across 79 bounded batches.
- Root `pnpm check` exited 0: lint; 61 successful builds; 60 successful typechecks; 3,252 fast tests; 1,542 slow tests passed with 60 skipped; slowest-test report completed.
- Exact synchronous-update test passes after restoring callback result propagation.
- Regression workflow source and generated suites each pass 27/27; resource mirrors are byte-identical.
- P1 autoreview is clean with no accepted or actionable findings.
- The strict Oxlint configuration-policy audit still exits 1 on inherited project-wide migration debt. The task-owned Prism violation is absent; the audit reports no missing reasons, forbidden reasons, or invalid inline directives for this repair. This auxiliary audit is not the repository CI gate.

Final handoff contract:
- PR: N/A: not requested.
- Issue / tracker: N/A: not supplied.
- Confidence: high; package, browser, strict Plite, root CI, workflow, and review gates agree.
- Outcome: both proven package boundaries are fixed without splitting Yjs.
- Caveat: the separate repository-wide Oxlint policy migration remains unfinished; normal lint and root CI are green.
- Design: dependency metadata owns install requirements; source entrypoints retain their real integration peers; source-owned CI failures were fixed at their runtime owners.
- Mutation status: local files only; no commit, push, PR, comment, or tracker update.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Closeout is complete. |
| Where am I going? | Final user handoff. |
| What is the goal? | Fix and prove the package boundaries with green CI. |
| What have I learned? | Both package findings were real; Yjs splitting was unnecessary; strict CI exposed additional source-owned regressions worth fixing. |
| What have I done? | Implemented the metadata correction, fixed every source-owned gate failure, and completed all required proof. |

Open risks:
- No open task-scoped correctness risk is known.
- Separate maintenance debt: the auxiliary Oxlint policy audit rejects many inherited project-global exceptions and one unrelated block directive. Root lint and root CI pass.
